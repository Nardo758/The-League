from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select

from app.core.cache import cache_key, get_cached_list, invalidate_list_cache, set_cached_list
from app.db import get_session
from app.deps import get_current_user
from app.models import User, Venue, VenueMember, VenueRole
from app.schemas import PaginatedResponse, VenueCreate, VenueRead, VenueUpdate, paginate

router = APIRouter(prefix="/venues", tags=["venues"])


def get_distance_miles(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    from math import radians, sin, cos, sqrt, atan2
    R = 3959
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c


@router.get("", response_model=PaginatedResponse[VenueRead])
def list_venues(
    city: str | None = None,
    state: str | None = None,
    venue_type: str | None = None,
    latitude: float | None = Query(None, description="User latitude for location search"),
    longitude: float | None = Query(None, description="User longitude for location search"),
    radius_miles: float = Query(50, ge=1, le=500, description="Search radius in miles"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session)
):
    cache_id = f"venues:{cache_key(city=city, state=state, venue_type=venue_type, page=page, page_size=page_size)}"
    if latitude is None and longitude is None:
        cached = get_cached_list(cache_id)
        if cached is not None:
            return cached

    stmt = select(Venue)
    count_stmt = select(func.count()).select_from(Venue)

    if city:
        stmt = stmt.where(Venue.city == city)
        count_stmt = count_stmt.where(Venue.city == city)
    if state:
        stmt = stmt.where(Venue.state == state)
        count_stmt = count_stmt.where(Venue.state == state)
    if venue_type:
        stmt = stmt.where(Venue.venue_type == venue_type)
        count_stmt = count_stmt.where(Venue.venue_type == venue_type)

    all_venues = list(session.exec(stmt).all())

    if latitude is not None and longitude is not None:
        filtered = []
        for v in all_venues:
            if v.latitude is not None and v.longitude is not None:
                dist = get_distance_miles(latitude, longitude, v.latitude, v.longitude)
                if dist <= radius_miles:
                    filtered.append(v)
        all_venues = filtered

    total = len(all_venues)
    start = (page - 1) * page_size
    end = start + page_size
    page_venues = all_venues[start:end]

    items = [VenueRead.model_validate(v) for v in page_venues]
    result = paginate(items, total, page, page_size)

    if latitude is None and longitude is None:
        set_cached_list(cache_id, result)

    return result


@router.get("/{venue_id}", response_model=VenueRead)
def get_venue(venue_id: int, session: Session = Depends(get_session)):
    venue = session.get(Venue, venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    return venue


@router.post("", response_model=VenueRead, status_code=status.HTTP_201_CREATED)
def create_venue(
    payload: VenueCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    venue = Venue(**payload.model_dump(), owner_id=current_user.id)
    session.add(venue)
    session.commit()
    session.refresh(venue)

    member = VenueMember(venue_id=venue.id, user_id=current_user.id, role=VenueRole.owner)
    session.add(member)
    session.commit()

    invalidate_list_cache("venues:")
    return venue


@router.patch("/{venue_id}", response_model=VenueRead)
def update_venue(
    venue_id: int,
    payload: VenueUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    venue = session.get(Venue, venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")

    member = session.exec(
        select(VenueMember).where(
            VenueMember.venue_id == venue_id,
            VenueMember.user_id == current_user.id,
            VenueMember.role.in_([VenueRole.owner, VenueRole.admin])
        )
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not authorized to update this venue")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(venue, key, value)

    session.add(venue)
    session.commit()
    session.refresh(venue)

    invalidate_list_cache("venues:")
    return venue


@router.delete("/{venue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_venue(
    venue_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    venue = session.get(Venue, venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")

    if venue.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only venue owner can delete")

    session.delete(venue)
    session.commit()
    invalidate_list_cache("venues:")
