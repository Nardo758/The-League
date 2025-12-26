from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.db import get_session
from app.deps import get_current_user
from app.models import User, UserLocation
from app.schemas import (
    UserLocationCreate,
    UserLocationUpdate,
    UserLocationRead,
)

router = APIRouter(prefix="/users/me/locations", tags=["locations"])


@router.get("", response_model=list[UserLocationRead])
def list_saved_locations(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    stmt = select(UserLocation).where(
        UserLocation.user_id == current_user.id
    ).order_by(UserLocation.is_primary.desc(), UserLocation.created_at)
    locations = session.exec(stmt).all()
    return [UserLocationRead.model_validate(loc) for loc in locations]


@router.post("", response_model=UserLocationRead, status_code=201)
def create_saved_location(
    data: UserLocationCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    existing_count = session.exec(
        select(UserLocation).where(UserLocation.user_id == current_user.id)
    ).all()
    if len(existing_count) >= 10:
        raise HTTPException(status_code=400, detail="Maximum 10 saved locations allowed")
    
    if data.is_primary:
        existing_primary = session.exec(
            select(UserLocation).where(
                UserLocation.user_id == current_user.id,
                UserLocation.is_primary == True
            )
        ).first()
        if existing_primary:
            existing_primary.is_primary = False
            session.add(existing_primary)
    
    location = UserLocation(
        user_id=current_user.id,
        label=data.label,
        city=data.city,
        state=data.state,
        latitude=data.latitude,
        longitude=data.longitude,
        radius_miles=data.radius_miles,
        is_primary=data.is_primary
    )
    session.add(location)
    session.commit()
    session.refresh(location)
    
    if data.is_primary:
        current_user.latitude = data.latitude
        current_user.longitude = data.longitude
        current_user.city = data.city
        current_user.state = data.state
        current_user.search_radius_miles = data.radius_miles
        session.add(current_user)
        session.commit()
    
    return UserLocationRead.model_validate(location)


@router.get("/{location_id}", response_model=UserLocationRead)
def get_saved_location(
    location_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    location = session.get(UserLocation, location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    if location.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return UserLocationRead.model_validate(location)


@router.patch("/{location_id}", response_model=UserLocationRead)
def update_saved_location(
    location_id: int,
    data: UserLocationUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    location = session.get(UserLocation, location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    if location.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = data.model_dump(exclude_unset=True)
    
    if update_data.get("is_primary", False):
        existing_primary = session.exec(
            select(UserLocation).where(
                UserLocation.user_id == current_user.id,
                UserLocation.is_primary == True,
                UserLocation.id != location_id
            )
        ).first()
        if existing_primary:
            existing_primary.is_primary = False
            session.add(existing_primary)
    
    for key, value in update_data.items():
        setattr(location, key, value)
    
    session.add(location)
    session.commit()
    session.refresh(location)
    
    if location.is_primary:
        current_user.latitude = location.latitude
        current_user.longitude = location.longitude
        current_user.city = location.city
        current_user.state = location.state
        current_user.search_radius_miles = location.radius_miles
        session.add(current_user)
        session.commit()
    
    return UserLocationRead.model_validate(location)


@router.delete("/{location_id}", status_code=204)
def delete_saved_location(
    location_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    location = session.get(UserLocation, location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    if location.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    session.delete(location)
    session.commit()


@router.post("/{location_id}/set-primary", response_model=UserLocationRead)
def set_primary_location(
    location_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    location = session.get(UserLocation, location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    if location.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    existing_primary = session.exec(
        select(UserLocation).where(
            UserLocation.user_id == current_user.id,
            UserLocation.is_primary == True,
            UserLocation.id != location_id
        )
    ).first()
    if existing_primary:
        existing_primary.is_primary = False
        session.add(existing_primary)
    
    location.is_primary = True
    session.add(location)
    
    current_user.latitude = location.latitude
    current_user.longitude = location.longitude
    current_user.city = location.city
    current_user.state = location.state
    current_user.search_radius_miles = location.radius_miles
    session.add(current_user)
    
    session.commit()
    session.refresh(location)
    
    return UserLocationRead.model_validate(location)
