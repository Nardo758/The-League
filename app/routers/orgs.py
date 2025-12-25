from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select

from app.core.cache import cache_key, get_cached_list, invalidate_entity_cache, invalidate_list_cache, set_cached_list
from app.db import get_session
from app.deps import get_current_user
from app.models import Organization
from app.schemas import OrganizationCreate, OrganizationRead, OrganizationUpdate, PaginatedResponse, paginate


router = APIRouter(prefix="/orgs", tags=["orgs"])


@router.get("", response_model=PaginatedResponse[OrganizationRead])
def list_orgs(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    session: Session = Depends(get_session)
):
    cache_id = f"orgs:{cache_key(page=page, page_size=page_size)}"
    cached = get_cached_list(cache_id)
    if cached is not None:
        return cached
    
    count_stmt = select(func.count()).select_from(Organization)
    total = session.exec(count_stmt).one()
    
    stmt = select(Organization).order_by(Organization.created_at.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    
    items = [OrganizationRead.model_validate(org) for org in session.exec(stmt).all()]
    result = paginate(items, total, page, page_size)
    set_cached_list(cache_id, result)
    return result


@router.post("", response_model=OrganizationRead, status_code=status.HTTP_201_CREATED)
def create_org(
    payload: OrganizationCreate,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    org = Organization(**payload.model_dump(), owner_id=current_user.id)
    session.add(org)
    session.commit()
    session.refresh(org)
    
    invalidate_list_cache("orgs")
    return org


@router.get("/{org_id}", response_model=OrganizationRead)
def get_org(org_id: int, session: Session = Depends(get_session)):
    org = session.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


@router.patch("/{org_id}", response_model=OrganizationRead)
def update_org(
    org_id: int,
    payload: OrganizationUpdate,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    org = session.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    if org.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this organization")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(org, key, value)
    
    session.add(org)
    session.commit()
    session.refresh(org)
    
    invalidate_list_cache("orgs")
    invalidate_entity_cache("org", org_id)
    return org


@router.delete("/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_org(
    org_id: int,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    org = session.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    if org.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this organization")
    
    session.delete(org)
    session.commit()
    
    invalidate_list_cache("orgs")
    invalidate_entity_cache("org", org_id)
    return None
