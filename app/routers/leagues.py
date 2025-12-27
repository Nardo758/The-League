from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select

from app.core.cache import cache_key, get_cached_list, invalidate_list_cache, set_cached_list
from app.db import get_session
from app.deps import get_current_user
from app.models import League, Sport, User, Venue, VenueMember, VenueRole
from app.schemas import LeagueCreate, LeagueRead, LeagueUpdate, PaginatedResponse, paginate
from app.utils.geo import haversine_distance

router = APIRouter(prefix="/leagues", tags=["leagues"])


@router.get("", response_model=PaginatedResponse[LeagueRead])
def list_leagues(
    venue_id: int | None = None,
    sport_id: int | None = None,
    is_active: bool | None = None,
    latitude: float | None = Query(None, description="User latitude for location search"),
    longitude: float | None = Query(None, description="User longitude for location search"),
    radius_miles: float = Query(50, ge=1, le=500, description="Search radius in miles"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session)
):
    cache_id = f"leagues:{cache_key(venue_id=venue_id, sport_id=sport_id, is_active=is_active, page=page, page_size=page_size)}"
    if latitude is None and longitude is None:
        cached = get_cached_list(cache_id)
        if cached is not None:
            return cached

    stmt = select(League)
    count_stmt = select(func.count()).select_from(League)

    if venue_id is not None:
        stmt = stmt.where(League.venue_id == venue_id)
        count_stmt = count_stmt.where(League.venue_id == venue_id)
    if sport_id is not None:
        stmt = stmt.where(League.sport_id == sport_id)
        count_stmt = count_stmt.where(League.sport_id == sport_id)
    if is_active is not None:
        stmt = stmt.where(League.is_active == is_active)
        count_stmt = count_stmt.where(League.is_active == is_active)

    all_leagues = list(session.exec(stmt).all())
    leagues_with_distance: list[tuple] = []

    if latitude is not None and longitude is not None:
        for league in all_leagues:
            venue = session.get(Venue, league.venue_id)
            if venue and venue.latitude is not None and venue.longitude is not None:
                dist = haversine_distance(latitude, longitude, venue.latitude, venue.longitude)
                if dist <= radius_miles:
                    leagues_with_distance.append((league, round(dist, 1)))
        leagues_with_distance.sort(key=lambda x: x[1])
    else:
        leagues_with_distance = [(league, None) for league in all_leagues]

    total = len(leagues_with_distance)
    start = (page - 1) * page_size
    end = start + page_size
    page_leagues = leagues_with_distance[start:end]

    items = []
    for league, dist in page_leagues:
        league_data = LeagueRead.model_validate(league)
        league_data.distance_miles = dist
        items.append(league_data)
    result = paginate(items, total, page, page_size)
    
    if latitude is None and longitude is None:
        set_cached_list(cache_id, result)
    return result


@router.get("/{league_id}", response_model=LeagueRead)
def get_league(league_id: int, session: Session = Depends(get_session)):
    league = session.get(League, league_id)
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    return league


@router.post("", response_model=LeagueRead, status_code=status.HTTP_201_CREATED)
def create_league(
    payload: LeagueCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    venue = session.get(Venue, payload.venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")

    member = session.exec(
        select(VenueMember).where(
            VenueMember.venue_id == payload.venue_id,
            VenueMember.user_id == current_user.id,
            VenueMember.role.in_([VenueRole.owner, VenueRole.admin])
        )
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not authorized to create leagues for this venue")

    sport = session.get(Sport, payload.sport_id)
    if not sport:
        raise HTTPException(status_code=404, detail="Sport not found")

    league = League(**payload.model_dump())
    session.add(league)
    session.commit()
    session.refresh(league)

    invalidate_list_cache("leagues:")
    return league


@router.patch("/{league_id}", response_model=LeagueRead)
def update_league(
    league_id: int,
    payload: LeagueUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    league = session.get(League, league_id)
    if not league:
        raise HTTPException(status_code=404, detail="League not found")

    member = session.exec(
        select(VenueMember).where(
            VenueMember.venue_id == league.venue_id,
            VenueMember.user_id == current_user.id,
            VenueMember.role.in_([VenueRole.owner, VenueRole.admin])
        )
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not authorized to update this league")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(league, key, value)

    session.add(league)
    session.commit()
    session.refresh(league)

    invalidate_list_cache("leagues:")
    return league


@router.delete("/{league_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_league(
    league_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    league = session.get(League, league_id)
    if not league:
        raise HTTPException(status_code=404, detail="League not found")

    venue = session.get(Venue, league.venue_id)
    if venue.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only venue owner can delete leagues")

    session.delete(league)
    session.commit()
    invalidate_list_cache("leagues:")
