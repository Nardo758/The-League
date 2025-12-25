from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select

from app.core.cache import cache_key, get_cached_list, invalidate_list_cache, set_cached_list
from app.db import get_session
from app.deps import get_current_user
from app.models import League, Team, User, VenueMember, VenueRole
from app.schemas import PaginatedResponse, TeamCreate, TeamRead, TeamUpdate, paginate

router = APIRouter(prefix="/teams", tags=["teams"])


@router.get("", response_model=PaginatedResponse[TeamRead])
def list_teams(
    league_id: int | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session)
):
    cache_id = f"teams:{cache_key(league_id=league_id, page=page, page_size=page_size)}"
    cached = get_cached_list(cache_id)
    if cached is not None:
        return cached

    stmt = select(Team)
    count_stmt = select(func.count()).select_from(Team)

    if league_id is not None:
        stmt = stmt.where(Team.league_id == league_id)
        count_stmt = count_stmt.where(Team.league_id == league_id)

    total = session.exec(count_stmt).one()

    stmt = stmt.order_by(Team.name)
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    items = [TeamRead.model_validate(team) for team in session.exec(stmt).all()]
    result = paginate(items, total, page, page_size)
    set_cached_list(cache_id, result)
    return result


@router.get("/{team_id}", response_model=TeamRead)
def get_team(team_id: int, session: Session = Depends(get_session)):
    team = session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team


@router.post("", response_model=TeamRead, status_code=status.HTTP_201_CREATED)
def create_team(
    payload: TeamCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    league = session.get(League, payload.league_id)
    if not league:
        raise HTTPException(status_code=404, detail="League not found")

    member = session.exec(
        select(VenueMember).where(
            VenueMember.venue_id == league.venue_id,
            VenueMember.user_id == current_user.id,
            VenueMember.role.in_([VenueRole.owner, VenueRole.admin, VenueRole.staff])
        )
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not authorized to create teams for this league")

    team = Team(**payload.model_dump())
    session.add(team)
    session.commit()
    session.refresh(team)

    invalidate_list_cache("teams:")
    return team


@router.patch("/{team_id}", response_model=TeamRead)
def update_team(
    team_id: int,
    payload: TeamUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    team = session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    league = session.get(League, team.league_id)
    member = session.exec(
        select(VenueMember).where(
            VenueMember.venue_id == league.venue_id,
            VenueMember.user_id == current_user.id,
            VenueMember.role.in_([VenueRole.owner, VenueRole.admin, VenueRole.staff])
        )
    ).first()
    is_captain = team.captain_id == current_user.id

    if not member and not is_captain:
        raise HTTPException(status_code=403, detail="Not authorized to update this team")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(team, key, value)

    session.add(team)
    session.commit()
    session.refresh(team)

    invalidate_list_cache("teams:")
    return team


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(
    team_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    team = session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    league = session.get(League, team.league_id)
    member = session.exec(
        select(VenueMember).where(
            VenueMember.venue_id == league.venue_id,
            VenueMember.user_id == current_user.id,
            VenueMember.role.in_([VenueRole.owner, VenueRole.admin])
        )
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not authorized to delete this team")

    session.delete(team)
    session.commit()
    invalidate_list_cache("teams:")
