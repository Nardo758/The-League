from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db import get_session
from app.deps import get_current_user
from app.models import League, Organization, Post, PostCreate, PostRead


router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("", response_model=list[PostRead])
def list_posts(
    org_id: int | None = None,
    league_id: int | None = None,
    session: Session = Depends(get_session),
):
    stmt = select(Post).order_by(Post.created_at.desc())
    if org_id is not None:
        stmt = stmt.where(Post.org_id == org_id)
    if league_id is not None:
        stmt = stmt.where(Post.league_id == league_id)
    return list(session.exec(stmt).all())


@router.post("", response_model=PostRead, status_code=status.HTTP_201_CREATED)
def create_post(
    payload: PostCreate,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    if payload.org_id is not None:
        org = session.get(Organization, payload.org_id)
        if not org:
            raise HTTPException(status_code=404, detail="Org not found")
        if org.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not allowed")
    if payload.league_id is not None:
        league = session.get(League, payload.league_id)
        if not league:
            raise HTTPException(status_code=404, detail="League not found")
        org = session.get(Organization, league.org_id)
        if not org or org.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not allowed")
    post = Post(**payload.model_dump(), author_id=current_user.id)
    session.add(post)
    session.commit()
    session.refresh(post)
    return post


@router.get("/{post_id}", response_model=PostRead)
def get_post(post_id: int, session: Session = Depends(get_session)):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.patch("/{post_id}", response_model=PostRead)
def update_post(
    post_id: int,
    payload: PostCreate,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    post.title = payload.title
    post.body = payload.body
    post.org_id = payload.org_id
    post.league_id = payload.league_id
    session.add(post)
    session.commit()
    session.refresh(post)
    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    session.delete(post)
    session.commit()
    return None

