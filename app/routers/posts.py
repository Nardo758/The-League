from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select

from app.core.cache import cache_key, get_cached_list, invalidate_list_cache, set_cached_list
from app.db import get_session
from app.deps import get_current_user
from app.models import League, NotificationType, Post, User, Venue, VenueMember, VenueRole
from app.schemas import PaginatedResponse, PostCreate, PostRead, PostUpdate, paginate
from app.routers.notifications import notify_league_participants

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("", response_model=PaginatedResponse[PostRead])
def list_posts(
    venue_id: int | None = None,
    league_id: int | None = None,
    post_type: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session)
):
    cache_id = f"posts:{cache_key(venue_id=venue_id, league_id=league_id, post_type=post_type, page=page, page_size=page_size)}"
    cached = get_cached_list(cache_id)
    if cached is not None:
        return cached

    stmt = select(Post)
    count_stmt = select(func.count()).select_from(Post)

    if venue_id is not None:
        stmt = stmt.where(Post.venue_id == venue_id)
        count_stmt = count_stmt.where(Post.venue_id == venue_id)
    if league_id is not None:
        stmt = stmt.where(Post.league_id == league_id)
        count_stmt = count_stmt.where(Post.league_id == league_id)
    if post_type is not None:
        stmt = stmt.where(Post.post_type == post_type)
        count_stmt = count_stmt.where(Post.post_type == post_type)

    total = session.exec(count_stmt).one()

    stmt = stmt.order_by(Post.is_pinned.desc(), Post.created_at.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    items = [PostRead.model_validate(post) for post in session.exec(stmt).all()]
    result = paginate(items, total, page, page_size)
    set_cached_list(cache_id, result)
    return result


@router.get("/feed", response_model=PaginatedResponse[PostRead])
def get_bulletin_board(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session)
):
    cache_id = f"posts:feed:{cache_key(page=page, page_size=page_size)}"
    cached = get_cached_list(cache_id)
    if cached is not None:
        return cached

    count_stmt = select(func.count()).select_from(Post)
    total = session.exec(count_stmt).one()

    stmt = select(Post).order_by(Post.is_pinned.desc(), Post.created_at.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    items = [PostRead.model_validate(post) for post in session.exec(stmt).all()]
    result = paginate(items, total, page, page_size)
    set_cached_list(cache_id, result)
    return result


@router.get("/{post_id}", response_model=PostRead)
def get_post(post_id: int, session: Session = Depends(get_session)):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("", response_model=PostRead, status_code=status.HTTP_201_CREATED)
def create_post(
    payload: PostCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if payload.venue_id:
        venue = session.get(Venue, payload.venue_id)
        if not venue:
            raise HTTPException(status_code=404, detail="Venue not found")

        member = session.exec(
            select(VenueMember).where(
                VenueMember.venue_id == payload.venue_id,
                VenueMember.user_id == current_user.id
            )
        ).first()
        if not member:
            raise HTTPException(status_code=403, detail="Not authorized to post to this venue")

    post = Post(**payload.model_dump(), author_id=current_user.id)
    session.add(post)
    session.commit()
    session.refresh(post)

    if payload.league_id:
        league = session.get(League, payload.league_id)
        if league:
            notify_league_participants(
                session=session,
                league_id=payload.league_id,
                notification_type=NotificationType.new_post,
                title=f"New Post in {league.name}",
                message=f"{current_user.full_name or 'A league organizer'} posted an update",
                link=f"/posts/{post.id}",
                exclude_user_id=current_user.id
            )
            session.commit()

    invalidate_list_cache("posts:")
    return post


@router.patch("/{post_id}", response_model=PostRead)
def update_post(
    post_id: int,
    payload: PostUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.author_id != current_user.id:
        if post.venue_id:
            member = session.exec(
                select(VenueMember).where(
                    VenueMember.venue_id == post.venue_id,
                    VenueMember.user_id == current_user.id,
                    VenueMember.role.in_([VenueRole.owner, VenueRole.admin])
                )
            ).first()
            if not member:
                raise HTTPException(status_code=403, detail="Not authorized to update this post")
        else:
            raise HTTPException(status_code=403, detail="Not authorized to update this post")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(post, key, value)

    session.add(post)
    session.commit()
    session.refresh(post)

    invalidate_list_cache("posts:")
    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.author_id != current_user.id:
        if post.venue_id:
            member = session.exec(
                select(VenueMember).where(
                    VenueMember.venue_id == post.venue_id,
                    VenueMember.user_id == current_user.id,
                    VenueMember.role.in_([VenueRole.owner, VenueRole.admin])
                )
            ).first()
            if not member:
                raise HTTPException(status_code=403, detail="Not authorized to delete this post")
        else:
            raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    session.delete(post)
    session.commit()
    invalidate_list_cache("posts:")
