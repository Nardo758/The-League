from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select
from sqlalchemy.orm import joinedload

from app.core.cache import cache_key, get_cached_list, invalidate_entity_cache, invalidate_list_cache, set_cached_list
from app.db import get_session
from app.deps import get_current_user
from app.models import League, Organization, Post
from app.schemas import PaginatedResponse, PostCreate, PostRead, PostUpdate, paginate


router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("", response_model=PaginatedResponse[PostRead])
def list_posts(
    org_id: int | None = None,
    league_id: int | None = None,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    session: Session = Depends(get_session),
):
    cache_id = f"posts:{cache_key(org_id=org_id, league_id=league_id, page=page, page_size=page_size)}"
    cached = get_cached_list(cache_id)
    if cached is not None:
        return cached
    
    stmt = select(Post)
    count_stmt = select(func.count()).select_from(Post)
    
    if org_id is not None:
        stmt = stmt.where(Post.org_id == org_id)
        count_stmt = count_stmt.where(Post.org_id == org_id)
    if league_id is not None:
        stmt = stmt.where(Post.league_id == league_id)
        count_stmt = count_stmt.where(Post.league_id == league_id)
    
    total = session.exec(count_stmt).one()
    
    stmt = stmt.order_by(Post.created_at.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    
    items = [PostRead.model_validate(post) for post in session.exec(stmt).all()]
    result = paginate(items, total, page, page_size)
    set_cached_list(cache_id, result)
    return result


@router.post("", response_model=PostRead, status_code=status.HTTP_201_CREATED)
def create_post(
    payload: PostCreate,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    if payload.org_id is not None:
        org = session.get(Organization, payload.org_id)
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")
        if org.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to post in this organization")
    
    if payload.league_id is not None:
        stmt = select(League).where(League.id == payload.league_id).options(joinedload(League.org))
        league = session.exec(stmt).first()
        if not league:
            raise HTTPException(status_code=404, detail="League not found")
        if not league.org or league.org.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to post in this league")
    
    post = Post(**payload.model_dump(), author_id=current_user.id)
    session.add(post)
    session.commit()
    session.refresh(post)
    
    invalidate_list_cache("posts")
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
    payload: PostUpdate,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(post, key, value)
    
    session.add(post)
    session.commit()
    session.refresh(post)
    
    invalidate_list_cache("posts")
    invalidate_entity_cache("post", post_id)
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
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    session.delete(post)
    session.commit()
    
    invalidate_list_cache("posts")
    invalidate_entity_cache("post", post_id)
    return None
