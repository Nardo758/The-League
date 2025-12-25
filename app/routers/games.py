from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select

from app.core.cache import cache_key, get_cached_list, invalidate_list_cache, set_cached_list
from app.db import get_session
from app.deps import get_current_user
from app.models import Game, GameStatus, League, Season, User, VenueMember, VenueRole
from app.schemas import GameCreate, GameRead, GameUpdate, PaginatedResponse, paginate
from app.schemas import GameStatus as GameStatusSchema

router = APIRouter(prefix="/games", tags=["games"])


@router.get("", response_model=PaginatedResponse[GameRead])
def list_games(
    season_id: int | None = None,
    status_filter: GameStatusSchema | None = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session)
):
    status_val = status_filter.value if status_filter else None
    cache_id = f"games:{cache_key(season_id=season_id, status=status_val, page=page, page_size=page_size)}"
    cached = get_cached_list(cache_id)
    if cached is not None:
        return cached

    stmt = select(Game)
    count_stmt = select(func.count()).select_from(Game)

    if season_id is not None:
        stmt = stmt.where(Game.season_id == season_id)
        count_stmt = count_stmt.where(Game.season_id == season_id)
    if status_filter is not None:
        stmt = stmt.where(Game.status == status_filter.value)
        count_stmt = count_stmt.where(Game.status == status_filter.value)

    total = session.exec(count_stmt).one()

    stmt = stmt.order_by(Game.start_time.desc().nullslast(), Game.created_at.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    items = [GameRead.model_validate(game) for game in session.exec(stmt).all()]
    result = paginate(items, total, page, page_size)
    set_cached_list(cache_id, result)
    return result


@router.get("/{game_id}", response_model=GameRead)
def get_game(game_id: int, session: Session = Depends(get_session)):
    game = session.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


@router.post("", response_model=GameRead, status_code=status.HTTP_201_CREATED)
def create_game(
    payload: GameCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    season = session.get(Season, payload.season_id)
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")

    league = session.get(League, season.league_id)
    member = session.exec(
        select(VenueMember).where(
            VenueMember.venue_id == league.venue_id,
            VenueMember.user_id == current_user.id,
            VenueMember.role.in_([VenueRole.owner, VenueRole.admin, VenueRole.staff])
        )
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not authorized to create games for this season")

    game = Game(**payload.model_dump())
    session.add(game)
    session.commit()
    session.refresh(game)

    invalidate_list_cache("games:")
    return game


@router.patch("/{game_id}", response_model=GameRead)
def update_game(
    game_id: int,
    payload: GameUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    game = session.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    season = session.get(Season, game.season_id)
    league = session.get(League, season.league_id)
    member = session.exec(
        select(VenueMember).where(
            VenueMember.venue_id == league.venue_id,
            VenueMember.user_id == current_user.id,
            VenueMember.role.in_([VenueRole.owner, VenueRole.admin, VenueRole.staff])
        )
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not authorized to update this game")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "status" and value is not None:
            setattr(game, key, value.value if hasattr(value, "value") else value)
        else:
            setattr(game, key, value)

    session.add(game)
    session.commit()
    session.refresh(game)

    invalidate_list_cache("games:")
    return game


@router.delete("/{game_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_game(
    game_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    game = session.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    season = session.get(Season, game.season_id)
    league = session.get(League, season.league_id)
    member = session.exec(
        select(VenueMember).where(
            VenueMember.venue_id == league.venue_id,
            VenueMember.user_id == current_user.id,
            VenueMember.role.in_([VenueRole.owner, VenueRole.admin])
        )
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not authorized to delete this game")

    session.delete(game)
    session.commit()
    invalidate_list_cache("games:")
