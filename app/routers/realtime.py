from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from app.db import get_session
from app.deps import get_current_user
from app.models import Game, User
from app.security import create_access_token

router = APIRouter(tags=["realtime"])


class RealtimeTokenResponse(BaseModel):
    token: str
    game_id: int
    user_id: int
    expires_in_seconds: int


REALTIME_TOKEN_EXPIRY_MINUTES = 60


@router.post("/games/{game_id}/realtime-token", response_model=RealtimeTokenResponse)
def get_realtime_token(
    game_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> RealtimeTokenResponse:
    game = session.exec(select(Game).where(Game.id == game_id)).first()
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )

    token = create_access_token(
        subject=str(current_user.id),
        minutes=REALTIME_TOKEN_EXPIRY_MINUTES,
    )

    return RealtimeTokenResponse(
        token=token,
        game_id=game_id,
        user_id=current_user.id,
        expires_in_seconds=REALTIME_TOKEN_EXPIRY_MINUTES * 60
    )


class RealtimeValidateRequest(BaseModel):
    token: str


class RealtimeValidateResponse(BaseModel):
    valid: bool
    user_id: int | None = None
    error: str | None = None


@router.post("/realtime/validate", response_model=RealtimeValidateResponse)
def validate_realtime_token(
    payload: RealtimeValidateRequest,
    session: Session = Depends(get_session)
) -> RealtimeValidateResponse:
    from jose import JWTError
    from app.security import decode_token

    try:
        decoded = decode_token(payload.token)
        user_id = int(decoded.get("sub", 0))
        if not user_id:
            return RealtimeValidateResponse(valid=False, error="Invalid token subject")

        user = session.exec(select(User).where(User.id == user_id)).first()
        if not user or not user.is_active:
            return RealtimeValidateResponse(valid=False, error="User not found or inactive")

        return RealtimeValidateResponse(valid=True, user_id=user_id)

    except JWTError as e:
        return RealtimeValidateResponse(valid=False, error=f"Token validation failed: {str(e)}")
    except Exception:
        return RealtimeValidateResponse(valid=False, error="Token validation error")
