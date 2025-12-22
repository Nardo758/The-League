from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db import get_session
from app.deps import get_current_user
from app.models import League, LeagueCreate, LeagueRead, Organization


router = APIRouter(prefix="/leagues", tags=["leagues"])


@router.get("", response_model=list[LeagueRead])
def list_leagues(org_id: int | None = None, session: Session = Depends(get_session)):
    stmt = select(League).order_by(League.created_at.desc())
    if org_id is not None:
        stmt = stmt.where(League.org_id == org_id)
    return list(session.exec(stmt).all())


@router.post("", response_model=LeagueRead, status_code=status.HTTP_201_CREATED)
def create_league(
    payload: LeagueCreate,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    org = session.get(Organization, payload.org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Org not found")
    if org.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    league = League(**payload.model_dump())
    session.add(league)
    session.commit()
    session.refresh(league)
    return league


@router.get("/{league_id}", response_model=LeagueRead)
def get_league(league_id: int, session: Session = Depends(get_session)):
    league = session.get(League, league_id)
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    return league


@router.patch("/{league_id}", response_model=LeagueRead)
def update_league(
    league_id: int,
    payload: LeagueCreate,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    league = session.get(League, league_id)
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    org = session.get(Organization, league.org_id)
    if not org or org.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    league.name = payload.name
    league.sport = payload.sport
    league.season = payload.season
    session.add(league)
    session.commit()
    session.refresh(league)
    return league


@router.delete("/{league_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_league(
    league_id: int,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    league = session.get(League, league_id)
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    org = session.get(Organization, league.org_id)
    if not org or org.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    session.delete(league)
    session.commit()
    return None

