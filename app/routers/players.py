from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db import get_session
from app.deps import get_current_user
from app.models import League, Organization, Player, PlayerCreate, PlayerRead, Team


router = APIRouter(prefix="/players", tags=["players"])


@router.get("", response_model=list[PlayerRead])
def list_players(team_id: int | None = None, session: Session = Depends(get_session)):
    stmt = select(Player).order_by(Player.created_at.desc())
    if team_id is not None:
        stmt = stmt.where(Player.team_id == team_id)
    return list(session.exec(stmt).all())


@router.post("", response_model=PlayerRead, status_code=status.HTTP_201_CREATED)
def create_player(
    payload: PlayerCreate,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    team = session.get(Team, payload.team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    league = session.get(League, team.league_id)
    org = session.get(Organization, league.org_id) if league else None
    if not org or org.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    player = Player(**payload.model_dump())
    session.add(player)
    session.commit()
    session.refresh(player)
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
    payload: PlayerCreate,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    player = session.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    team = session.get(Team, player.team_id)
    league = session.get(League, team.league_id) if team else None
    org = session.get(Organization, league.org_id) if league else None
    if not org or org.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    player.first_name = payload.first_name
    player.last_name = payload.last_name
    player.position = payload.position
    player.number = payload.number
    session.add(player)
    session.commit()
    session.refresh(player)
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
    team = session.get(Team, player.team_id)
    league = session.get(League, team.league_id) if team else None
    org = session.get(Organization, league.org_id) if league else None
    if not org or org.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    session.delete(player)
    session.commit()
    return None

