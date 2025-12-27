from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select

from app.core.cache import cache_key, get_cached_list, invalidate_list_cache, set_cached_list
from app.db import get_session
from app.deps import get_current_user
from app.models import User, Venue, VenueMember, VenueRole, VenueFollow
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
    venues_with_distance: list[tuple] = []

    if latitude is not None and longitude is not None:
        for v in all_venues:
            if v.latitude is not None and v.longitude is not None:
                dist = get_distance_miles(latitude, longitude, v.latitude, v.longitude)
                if dist <= radius_miles:
                    venues_with_distance.append((v, round(dist, 1)))
        venues_with_distance.sort(key=lambda x: x[1])
    else:
        venues_with_distance = [(v, None) for v in all_venues]

    total = len(venues_with_distance)
    start = (page - 1) * page_size
    end = start + page_size
    page_venues = venues_with_distance[start:end]

    items = []
    for venue, dist in page_venues:
        venue_data = VenueRead.model_validate(venue)
        venue_data.distance_miles = dist
        items.append(venue_data)
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


class VenueFollowCreate(BaseModel):
    notify_new_leagues: bool = True
    notify_events: bool = True
    notify_announcements: bool = True


class VenueFollowResponse(BaseModel):
    id: int
    venue_id: int
    user_id: int
    notify_new_leagues: bool
    notify_events: bool
    notify_announcements: bool
    is_following: bool = True


@router.post("/{venue_id}/follow", response_model=VenueFollowResponse)
def follow_venue(
    venue_id: int,
    prefs: VenueFollowCreate = VenueFollowCreate(),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    venue = session.get(Venue, venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    
    existing = session.exec(
        select(VenueFollow)
        .where(VenueFollow.venue_id == venue_id)
        .where(VenueFollow.user_id == current_user.id)
    ).first()
    
    if existing:
        existing.notify_new_leagues = prefs.notify_new_leagues
        existing.notify_events = prefs.notify_events
        existing.notify_announcements = prefs.notify_announcements
        existing.updated_at = datetime.utcnow()
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return VenueFollowResponse(
            id=existing.id,
            venue_id=existing.venue_id,
            user_id=existing.user_id,
            notify_new_leagues=existing.notify_new_leagues,
            notify_events=existing.notify_events,
            notify_announcements=existing.notify_announcements
        )
    
    new_follow = VenueFollow(
        venue_id=venue_id,
        user_id=current_user.id,
        notify_new_leagues=prefs.notify_new_leagues,
        notify_events=prefs.notify_events,
        notify_announcements=prefs.notify_announcements
    )
    session.add(new_follow)
    session.commit()
    session.refresh(new_follow)
    
    return VenueFollowResponse(
        id=new_follow.id,
        venue_id=new_follow.venue_id,
        user_id=new_follow.user_id,
        notify_new_leagues=new_follow.notify_new_leagues,
        notify_events=new_follow.notify_events,
        notify_announcements=new_follow.notify_announcements
    )


@router.delete("/{venue_id}/follow")
def unfollow_venue(
    venue_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    venue = session.get(Venue, venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    
    follow = session.exec(
        select(VenueFollow)
        .where(VenueFollow.venue_id == venue_id)
        .where(VenueFollow.user_id == current_user.id)
    ).first()
    
    if not follow:
        raise HTTPException(status_code=404, detail="Not following this venue")
    
    session.delete(follow)
    session.commit()
    
    return {"message": "Unfollowed venue successfully"}


@router.get("/{venue_id}/followers/count")
def get_venue_follower_count(
    venue_id: int,
    session: Session = Depends(get_session)
):
    venue = session.get(Venue, venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    
    count = session.exec(
        select(func.count(VenueFollow.id))
        .where(VenueFollow.venue_id == venue_id)
    ).one()
    
    return {"venue_id": venue_id, "follower_count": count}
