from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select

from app.core.cache import cache_key, get_cached_list, invalidate_entity_cache, invalidate_list_cache, set_cached_list
from app.db import get_session
from app.deps import get_current_user
from app.models import League, Organization
from app.schemas import LeagueCreate, LeagueRead, LeagueUpdate, PaginatedResponse, paginate


router = APIRouter(prefix="/leagues", tags=["leagues"])


@router.get("", response_model=PaginatedResponse[LeagueRead])
def list_leagues(
    org_id: int | None = None,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    session: Session = Depends(get_session)
):
    cache_id = f"leagues:{cache_key(org_id=org_id, page=page, page_size=page_size)}"
    cached = get_cached_list(cache_id)
    if cached is not None:
        return cached
    
    stmt = select(League)
    count_stmt = select(func.count()).select_from(League)
    
    if org_id is not None:
        stmt = stmt.where(League.org_id == org_id)
        count_stmt = count_stmt.where(League.org_id == org_id)
    
    total = session.exec(count_stmt).one()
    
    stmt = stmt.order_by(League.created_at.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    
    items = [LeagueRead.model_validate(league) for league in session.exec(stmt).all()]
    result = paginate(items, total, page, page_size)
    set_cached_list(cache_id, result)
    return result


@router.post("", response_model=LeagueRead, status_code=status.HTTP_201_CREATED)
def create_league(
    payload: LeagueCreate,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    org = session.get(Organization, payload.org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    if org.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to create leagues in this organization")
    
    league = League(**payload.model_dump())
    session.add(league)
    session.commit()
    session.refresh(league)
    
    invalidate_list_cache("leagues")
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
    payload: LeagueUpdate,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    league = session.get(League, league_id)
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    
    org = session.get(Organization, league.org_id)
    if not org or org.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this league")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(league, key, value)
    
    session.add(league)
    session.commit()
    session.refresh(league)
    
    invalidate_list_cache("leagues")
    invalidate_entity_cache("league", league_id)
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
        raise HTTPException(status_code=403, detail="Not authorized to delete this league")
    
    session.delete(league)
    session.commit()
    
    invalidate_list_cache("leagues")
    invalidate_entity_cache("league", league_id)
    return None
