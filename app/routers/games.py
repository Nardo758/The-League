from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db import get_session
from app.deps import get_current_user
from app.models import Game, GameCreate, GameRead, League, Organization


router = APIRouter(prefix="/games", tags=["games"])


@router.get("", response_model=list[GameRead])
def list_games(league_id: int | None = None, session: Session = Depends(get_session)):
    stmt = select(Game).order_by(Game.start_time.desc().nullslast(), Game.created_at.desc())
    if league_id is not None:
        stmt = stmt.where(Game.league_id == league_id)
    return list(session.exec(stmt).all())


@router.post("", response_model=GameRead, status_code=status.HTTP_201_CREATED)
def create_game(
    payload: GameCreate,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    league = session.get(League, payload.league_id)
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    org = session.get(Organization, league.org_id)
    if not org or org.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    if payload.home_team_id == payload.away_team_id:
        raise HTTPException(status_code=400, detail="home_team_id and away_team_id must differ")
    game = Game(**payload.model_dump())
    session.add(game)
    session.commit()
    session.refresh(game)
    return game


@router.get("/{game_id}", response_model=GameRead)
def get_game(game_id: int, session: Session = Depends(get_session)):
    game = session.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


@router.patch("/{game_id}", response_model=GameRead)
def update_game(
    game_id: int,
    payload: GameCreate,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    game = session.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    league = session.get(League, game.league_id)
    org = session.get(Organization, league.org_id) if league else None
    if not org or org.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    game.start_time = payload.start_time
    game.location = payload.location
    game.status = payload.status
    game.home_score = payload.home_score
    game.away_score = payload.away_score
    session.add(game)
    session.commit()
    session.refresh(game)
    return game


@router.delete("/{game_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_game(
    game_id: int,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    game = session.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    league = session.get(League, game.league_id)
    org = session.get(Organization, league.org_id) if league else None
    if not org or org.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    session.delete(game)
    session.commit()
    return None

