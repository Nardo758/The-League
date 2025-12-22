from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db import get_session
from app.deps import get_current_user
from app.models import Organization, OrganizationCreate, OrganizationRead


router = APIRouter(prefix="/orgs", tags=["orgs"])


@router.get("", response_model=list[OrganizationRead])
def list_orgs(session: Session = Depends(get_session)):
    return list(session.exec(select(Organization).order_by(Organization.created_at.desc())).all())


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
    return org


@router.get("/{org_id}", response_model=OrganizationRead)
def get_org(org_id: int, session: Session = Depends(get_session)):
    org = session.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Org not found")
    return org


@router.patch("/{org_id}", response_model=OrganizationRead)
def update_org(
    org_id: int,
    payload: OrganizationCreate,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    org = session.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Org not found")
    if org.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    org.name = payload.name
    org.description = payload.description
    session.add(org)
    session.commit()
    session.refresh(org)
    return org


@router.delete("/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_org(
    org_id: int,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    org = session.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Org not found")
    if org.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    session.delete(org)
    session.commit()
    return None

