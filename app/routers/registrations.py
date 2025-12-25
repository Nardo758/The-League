from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select

from app.core.cache import cache_key, get_cached_list, invalidate_list_cache, set_cached_list
from app.db import get_session
from app.deps import get_current_user
from app.models import League, Registration, RegistrationStatus, User, VenueMember, VenueRole
from app.schemas import PaginatedResponse, RegistrationCreate, RegistrationRead, RegistrationUpdate, paginate
from app.models import RegistrationMode

router = APIRouter(prefix="/registrations", tags=["registrations"])


@router.get("", response_model=PaginatedResponse[RegistrationRead])
def list_registrations(
    league_id: int | None = None,
    user_id: int | None = None,
    status_filter: RegistrationStatus | None = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session)
):
    cache_id = f"registrations:{cache_key(league_id=league_id, user_id=user_id, status=status_filter.value if status_filter else None, page=page, page_size=page_size)}"
    cached = get_cached_list(cache_id)
    if cached is not None:
        return cached

    stmt = select(Registration)
    count_stmt = select(func.count()).select_from(Registration)

    if league_id is not None:
        stmt = stmt.where(Registration.league_id == league_id)
        count_stmt = count_stmt.where(Registration.league_id == league_id)
    if user_id is not None:
        stmt = stmt.where(Registration.user_id == user_id)
        count_stmt = count_stmt.where(Registration.user_id == user_id)
    if status_filter is not None:
        stmt = stmt.where(Registration.status == status_filter)
        count_stmt = count_stmt.where(Registration.status == status_filter)

    total = session.exec(count_stmt).one()

    stmt = stmt.order_by(Registration.created_at.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    items = [RegistrationRead.model_validate(r) for r in session.exec(stmt).all()]
    result = paginate(items, total, page, page_size)
    set_cached_list(cache_id, result)
    return result


@router.post("", response_model=RegistrationRead, status_code=status.HTTP_201_CREATED)
def create_registration(
    payload: RegistrationCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    league = session.get(League, payload.league_id)
    if not league:
        raise HTTPException(status_code=404, detail="League not found")

    if not league.is_active:
        raise HTTPException(status_code=400, detail="League is not accepting registrations")

    existing = session.exec(
        select(Registration).where(
            Registration.league_id == payload.league_id,
            Registration.user_id == current_user.id
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already registered for this league")

    if league.max_participants:
        current_count = session.exec(
            select(func.count()).select_from(Registration).where(
                Registration.league_id == payload.league_id,
                Registration.status.in_([RegistrationStatus.approved, RegistrationStatus.pending])
            )
        ).one()
        if current_count >= league.max_participants:
            raise HTTPException(status_code=400, detail="League is full")

    initial_status = RegistrationStatus.approved if league.registration_mode == RegistrationMode.open else RegistrationStatus.pending

    registration = Registration(
        league_id=payload.league_id,
        user_id=current_user.id,
        team_id=payload.team_id,
        notes=payload.notes,
        status=initial_status
    )
    session.add(registration)
    session.commit()
    session.refresh(registration)

    invalidate_list_cache("registrations:")
    return registration


@router.patch("/{registration_id}", response_model=RegistrationRead)
def update_registration(
    registration_id: int,
    payload: RegistrationUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    registration = session.get(Registration, registration_id)
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")

    league = session.get(League, registration.league_id)

    member = session.exec(
        select(VenueMember).where(
            VenueMember.venue_id == league.venue_id,
            VenueMember.user_id == current_user.id,
            VenueMember.role.in_([VenueRole.owner, VenueRole.admin])
        )
    ).first()
    is_own = registration.user_id == current_user.id

    if not member and not is_own:
        raise HTTPException(status_code=403, detail="Not authorized to update this registration")

    if not member and payload.status is not None:
        raise HTTPException(status_code=403, detail="Only venue staff can change registration status")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(registration, key, value)

    session.add(registration)
    session.commit()
    session.refresh(registration)

    invalidate_list_cache("registrations:")
    return registration


@router.delete("/{registration_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_registration(
    registration_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    registration = session.get(Registration, registration_id)
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")

    if registration.user_id != current_user.id:
        league = session.get(League, registration.league_id)
        member = session.exec(
            select(VenueMember).where(
                VenueMember.venue_id == league.venue_id,
                VenueMember.user_id == current_user.id,
                VenueMember.role.in_([VenueRole.owner, VenueRole.admin])
            )
        ).first()
        if not member:
            raise HTTPException(status_code=403, detail="Not authorized to cancel this registration")

    registration.status = RegistrationStatus.cancelled
    session.add(registration)
    session.commit()

    invalidate_list_cache("registrations:")
