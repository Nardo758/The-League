import os
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlmodel import Session, select

from app.db import get_session
from app.deps import get_current_user
from app.models import League, Registration, RegistrationStatus, Season, User, Venue
from app.stripe_client import get_publishable_key, get_stripe_client

router = APIRouter(prefix="/payments", tags=["payments"])


class CheckoutRequest(BaseModel):
    season_id: int
    success_url: str | None = None
    cancel_url: str | None = None


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


class PaymentStatusResponse(BaseModel):
    registration_id: int
    payment_status: str
    amount_paid: int | None = None


@router.get("/config")
async def get_stripe_config():
    try:
        publishable_key = await get_publishable_key()
        return {"publishable_key": publishable_key}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe not configured: {str(e)}")


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout_session(
    payload: CheckoutRequest,
    request: Request,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    season = session.get(Season, payload.season_id)
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")

    league = session.get(League, season.league_id)
    if not league.registration_fee or league.registration_fee <= 0:
        raise HTTPException(status_code=400, detail="This league has no registration fee")

    existing_reg = session.exec(
        select(Registration).where(
            Registration.season_id == payload.season_id,
            Registration.user_id == current_user.id,
            Registration.status.in_([RegistrationStatus.approved, RegistrationStatus.pending])
        )
    ).first()

    if existing_reg:
        raise HTTPException(status_code=400, detail="Already registered for this season")

    stripe = await get_stripe_client()

    domains = os.environ.get("REPLIT_DOMAINS", "").split(",")
    base_url = f"https://{domains[0]}" if domains else str(request.base_url).rstrip("/")

    success_url = payload.success_url or f"{base_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = payload.cancel_url or f"{base_url}/payment/cancel"

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": f"{league.name} - {season.name}",
                        "description": f"Registration fee for {league.name}",
                    },
                    "unit_amount": int(league.registration_fee * 100),
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=current_user.email,
            metadata={
                "season_id": str(season.id),
                "user_id": str(current_user.id),
                "league_id": str(league.id),
            }
        )

        return CheckoutResponse(
            checkout_url=checkout_session.url,
            session_id=checkout_session.id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create checkout: {str(e)}")


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    session: Session = Depends(get_session)
):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if not sig_header:
        raise HTTPException(status_code=400, detail="Missing stripe-signature header")

    stripe = await get_stripe_client()

    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")
    if not webhook_secret:
        raise HTTPException(status_code=500, detail="Webhook secret not configured")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        checkout_session = event["data"]["object"]
        metadata = checkout_session.get("metadata", {})

        season_id = metadata.get("season_id")
        user_id = metadata.get("user_id")
        league_id = metadata.get("league_id")

        if season_id and user_id and league_id:
            existing = session.exec(
                select(Registration).where(
                    Registration.season_id == int(season_id),
                    Registration.user_id == int(user_id)
                )
            ).first()

            if existing:
                existing.status = RegistrationStatus.approved
                existing.payment_intent_id = checkout_session.get("payment_intent")
                session.add(existing)
            else:
                season = session.get(Season, int(season_id))
                league = session.get(League, int(league_id))

                registration = Registration(
                    league_id=int(league_id),
                    season_id=int(season_id),
                    user_id=int(user_id),
                    status=RegistrationStatus.approved,
                    payment_intent_id=checkout_session.get("payment_intent"),
                    payment_amount=league.registration_fee if league else None,
                    payment_status="paid"
                )
                session.add(registration)

            session.commit()

    return {"received": True}


@router.get("/verify/{session_id}")
async def verify_payment(
    session_id: str,
    db_session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    stripe = await get_stripe_client()

    try:
        checkout_session = stripe.checkout.Session.retrieve(session_id)

        if checkout_session.payment_status != "paid":
            return {"status": "pending", "payment_status": checkout_session.payment_status}

        metadata = checkout_session.metadata
        season_id = metadata.get("season_id")

        if season_id:
            registration = db_session.exec(
                select(Registration).where(
                    Registration.season_id == int(season_id),
                    Registration.user_id == current_user.id
                )
            ).first()

            if registration:
                return {
                    "status": "success",
                    "registration_id": registration.id,
                    "registration_status": registration.status
                }

        return {"status": "success", "payment_status": checkout_session.payment_status}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to verify payment: {str(e)}")


class SessionDetailsResponse(BaseModel):
    session_id: str
    payment_status: str
    status: str
    amount_total: int | None = None
    currency: str | None = None
    customer_email: str | None = None
    payment_intent: str | None = None
    created_at: int | None = None
    league: dict | None = None
    season: dict | None = None
    venue: dict | None = None
    user: dict | None = None
    registration: dict | None = None


@router.get("/session/{session_id}")
async def get_session_details(
    session_id: str,
    db_session: Session = Depends(get_session)
):
    """
    Retrieve full session details for payment success/cancel pages.
    This endpoint doesn't require authentication as users may not be logged in
    when returning from Stripe checkout.
    """
    stripe = await get_stripe_client()

    try:
        checkout_session = stripe.checkout.Session.retrieve(session_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail="Invalid or expired session")

    metadata = checkout_session.metadata or {}
    season_id = metadata.get("season_id")
    user_id = metadata.get("user_id")
    league_id = metadata.get("league_id")

    session_status = checkout_session.status
    is_expired = session_status == "expired"
    is_paid = checkout_session.payment_status == "paid"
    
    if is_expired:
        status = "expired"
    elif is_paid:
        status = "success"
    else:
        status = "pending"

    response_data = {
        "session_id": session_id,
        "payment_status": checkout_session.payment_status,
        "session_status": session_status,
        "status": status,
        "is_expired": is_expired,
        "amount_total": checkout_session.amount_total,
        "currency": checkout_session.currency,
        "customer_email": checkout_session.customer_email,
        "payment_intent": checkout_session.payment_intent,
        "created_at": checkout_session.created,
        "expires_at": getattr(checkout_session, 'expires_at', None),
    }

    if league_id:
        league = db_session.get(League, int(league_id))
        if league:
            venue = db_session.get(Venue, league.venue_id) if league.venue_id else None
            response_data["league"] = {
                "id": league.id,
                "name": league.name,
                "description": league.description,
                "registration_fee": league.registration_fee,
                "sport_id": league.sport_id,
            }
            if venue:
                response_data["venue"] = {
                    "id": venue.id,
                    "name": venue.name,
                    "address": venue.address,
                    "city": venue.city,
                    "state": venue.state,
                    "zip_code": venue.zip_code,
                }

    if season_id:
        season = db_session.get(Season, int(season_id))
        if season:
            response_data["season"] = {
                "id": season.id,
                "name": season.name,
                "start_date": str(season.start_date) if season.start_date else None,
                "end_date": str(season.end_date) if season.end_date else None,
            }

    if user_id:
        user = db_session.get(User, int(user_id))
        if user:
            response_data["user"] = {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
            }

        if season_id:
            registration = db_session.exec(
                select(Registration).where(
                    Registration.season_id == int(season_id),
                    Registration.user_id == int(user_id)
                )
            ).first()
            if registration:
                response_data["registration"] = {
                    "id": registration.id,
                    "status": registration.status.value if registration.status else None,
                    "payment_status": registration.payment_status,
                    "payment_amount": registration.payment_amount,
                    "payment_intent_id": registration.payment_intent_id,
                    "created_at": str(registration.created_at) if registration.created_at else None,
                }

    return response_data
