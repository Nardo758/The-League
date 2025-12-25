from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select

from app.core.cache import cache_key, get_cached_list, invalidate_list_cache, set_cached_list
from app.db import get_session
from app.deps import get_current_user
from app.models import League, Season, User, Venue, VenueMember, VenueRole
from app.schemas import PaginatedResponse, SeasonCreate, SeasonRead, SeasonUpdate, paginate

router = APIRouter(prefix="/seasons", tags=["seasons"])


@router.get("", response_model=PaginatedResponse[SeasonRead])
def list_seasons(
    league_id: int | None = None,
    is_active: bool | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session)
):
    cache_id = f"seasons:{cache_key(league_id=league_id, is_active=is_active, page=page, page_size=page_size)}"
    cached = get_cached_list(cache_id)
    if cached is not None:
        return cached

    stmt = select(Season)
    count_stmt = select(func.count()).select_from(Season)

    if league_id is not None:
        stmt = stmt.where(Season.league_id == league_id)
        count_stmt = count_stmt.where(Season.league_id == league_id)
    if is_active is not None:
        stmt = stmt.where(Season.is_active == is_active)
        count_stmt = count_stmt.where(Season.is_active == is_active)

    total = session.exec(count_stmt).one()

    stmt = stmt.order_by(Season.start_date.desc().nullslast())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    items = [SeasonRead.model_validate(s) for s in session.exec(stmt).all()]
    result = paginate(items, total, page, page_size)
    set_cached_list(cache_id, result)
    return result


@router.get("/{season_id}", response_model=SeasonRead)
def get_season(season_id: int, session: Session = Depends(get_session)):
    season = session.get(Season, season_id)
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")
    return season


@router.post("", response_model=SeasonRead, status_code=status.HTTP_201_CREATED)
def create_season(
    payload: SeasonCreate,
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
            VenueMember.role.in_([VenueRole.owner, VenueRole.admin])
        )
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not authorized to create seasons for this league")

    season = Season(**payload.model_dump())
    session.add(season)
    session.commit()
    session.refresh(season)

    invalidate_list_cache("seasons:")
    return season


@router.patch("/{season_id}", response_model=SeasonRead)
def update_season(
    season_id: int,
    payload: SeasonUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    season = session.get(Season, season_id)
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")

    league = session.get(League, season.league_id)
    member = session.exec(
        select(VenueMember).where(
            VenueMember.venue_id == league.venue_id,
            VenueMember.user_id == current_user.id,
            VenueMember.role.in_([VenueRole.owner, VenueRole.admin])
        )
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not authorized to update this season")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(season, key, value)

    session.add(season)
    session.commit()
    session.refresh(season)

    invalidate_list_cache("seasons:")
    return season
