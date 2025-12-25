from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select
from sqlalchemy.orm import joinedload

from app.core.cache import cache_key, get_cached_list, invalidate_entity_cache, invalidate_list_cache, set_cached_list
from app.db import get_session
from app.deps import get_current_user
from app.models import League, Player, Team
from app.schemas import PaginatedResponse, PlayerCreate, PlayerRead, PlayerUpdate, paginate


router = APIRouter(prefix="/players", tags=["players"])


@router.get("", response_model=PaginatedResponse[PlayerRead])
def list_players(
    team_id: int | None = None,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    session: Session = Depends(get_session)
):
    cache_id = f"players:{cache_key(team_id=team_id, page=page, page_size=page_size)}"
    cached = get_cached_list(cache_id)
    if cached is not None:
        return cached
    
    stmt = select(Player)
    count_stmt = select(func.count()).select_from(Player)
    
    if team_id is not None:
        stmt = stmt.where(Player.team_id == team_id)
        count_stmt = count_stmt.where(Player.team_id == team_id)
    
    total = session.exec(count_stmt).one()
    
    stmt = stmt.order_by(Player.last_name, Player.first_name)
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    
    items = [PlayerRead.model_validate(player) for player in session.exec(stmt).all()]
    result = paginate(items, total, page, page_size)
    set_cached_list(cache_id, result)
    return result


@router.post("", response_model=PlayerRead, status_code=status.HTTP_201_CREATED)
def create_player(
    payload: PlayerCreate,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    stmt = select(Team).where(Team.id == payload.team_id).options(
        joinedload(Team.league).joinedload(League.org)
    )
    team = session.exec(stmt).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    if not team.league or not team.league.org or team.league.org.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to add players to this team")
    
    player = Player(**payload.model_dump())
    session.add(player)
    session.commit()
    session.refresh(player)
    
    invalidate_list_cache("players")
    return player


@router.get("/{player_id}", response_model=PlayerRead)
def get_player(player_id: int, session: Session = Depends(get_session)):
    player = session.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player


@router.patch("/{player_id}", response_model=PlayerRead)
def update_player(
    player_id: int,
    payload: PlayerUpdate,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    player = session.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    stmt = select(Team).where(Team.id == player.team_id).options(
        joinedload(Team.league).joinedload(League.org)
    )
    team = session.exec(stmt).first()
    if not team or not team.league or not team.league.org or team.league.org.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this player")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(player, key, value)
    
    session.add(player)
    session.commit()
    session.refresh(player)
    
    invalidate_list_cache("players")
    invalidate_entity_cache("player", player_id)
    return player


@router.delete("/{player_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_player(
    player_id: int,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    player = session.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    stmt = select(Team).where(Team.id == player.team_id).options(
        joinedload(Team.league).joinedload(League.org)
    )
    team = session.exec(stmt).first()
    if not team or not team.league or not team.league.org or team.league.org.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this player")
    
    session.delete(player)
    session.commit()
    
    invalidate_list_cache("players")
    invalidate_entity_cache("player", player_id)
    return None
