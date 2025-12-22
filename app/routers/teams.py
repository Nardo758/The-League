from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db import get_session
from app.deps import get_current_user
from app.models import League, Organization, Team, TeamCreate, TeamRead


router = APIRouter(prefix="/teams", tags=["teams"])


@router.get("", response_model=list[TeamRead])
def list_teams(league_id: int | None = None, session: Session = Depends(get_session)):
    stmt = select(Team).order_by(Team.created_at.desc())
    if league_id is not None:
        stmt = stmt.where(Team.league_id == league_id)
    return list(session.exec(stmt).all())


@router.post("", response_model=TeamRead, status_code=status.HTTP_201_CREATED)
def create_team(
    payload: TeamCreate,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    league = session.get(League, payload.league_id)
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    org = session.get(Organization, league.org_id)
    if not org or org.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    team = Team(**payload.model_dump())
    session.add(team)
    session.commit()
    session.refresh(team)
    return team


@router.get("/{team_id}", response_model=TeamRead)
def get_team(team_id: int, session: Session = Depends(get_session)):
    team = session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team


@router.patch("/{team_id}", response_model=TeamRead)
def update_team(
    team_id: int,
    payload: TeamCreate,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    team = session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    league = session.get(League, team.league_id)
    org = session.get(Organization, league.org_id) if league else None
    if not org or org.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    team.name = payload.name
    team.city = payload.city
    session.add(team)
    session.commit()
    session.refresh(team)
    return team


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(
    team_id: int,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    team = session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    league = session.get(League, team.league_id)
    org = session.get(Organization, league.org_id) if league else None
    if not org or org.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    session.delete(team)
    session.commit()
    return None

