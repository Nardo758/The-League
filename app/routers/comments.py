from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select

from app.db import get_session
from app.deps import get_current_user
from app.models import Comment, Post, Reaction, ReactionType, User
from app.schemas import CommentCreate, CommentRead, CommentUpdate, PaginatedResponse, ReactionCreate, ReactionRead, paginate

router = APIRouter(prefix="/comments", tags=["comments"])


@router.post("", response_model=CommentRead, status_code=status.HTTP_201_CREATED)
def create_comment(
    payload: CommentCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    post = session.get(Post, payload.post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if payload.parent_id:
        parent = session.get(Comment, payload.parent_id)
        if not parent or parent.post_id != payload.post_id:
            raise HTTPException(status_code=400, detail="Invalid parent comment")

    comment = Comment(
        post_id=payload.post_id,
        author_id=current_user.id,
        parent_id=payload.parent_id,
        body=payload.body
    )
    session.add(comment)
    session.commit()
    session.refresh(comment)

    return comment


@router.get("/posts/{post_id}", response_model=PaginatedResponse[CommentRead])
def list_post_comments(
    post_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    session: Session = Depends(get_session)
):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    count_stmt = select(func.count()).select_from(Comment).where(
        Comment.post_id == post_id,
        Comment.is_deleted == False
    )
    total = session.exec(count_stmt).one()

    stmt = select(Comment).where(
        Comment.post_id == post_id,
        Comment.is_deleted == False
    ).order_by(Comment.created_at.asc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    items = [CommentRead.model_validate(c) for c in session.exec(stmt).all()]
    return paginate(items, total, page, page_size)


@router.patch("/{comment_id}", response_model=CommentRead)
def update_comment(
    comment_id: int,
    payload: CommentUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    comment = session.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this comment")

    if comment.is_deleted:
        raise HTTPException(status_code=400, detail="Cannot edit deleted comment")

    comment.body = payload.body
    session.add(comment)
    session.commit()
    session.refresh(comment)

    return comment


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    comment = session.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")

    comment.is_deleted = True
    comment.body = "[deleted]"
    session.add(comment)
    session.commit()


@router.post("/reactions", response_model=ReactionRead, status_code=status.HTTP_201_CREATED)
def add_reaction(
    payload: ReactionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not payload.post_id and not payload.comment_id:
        raise HTTPException(status_code=400, detail="Must specify post_id or comment_id")

    if payload.post_id and payload.comment_id:
        raise HTTPException(status_code=400, detail="Cannot react to both post and comment")

    if payload.post_id:
        post = session.get(Post, payload.post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

    if payload.comment_id:
        comment = session.get(Comment, payload.comment_id)
        if not comment or comment.is_deleted:
            raise HTTPException(status_code=404, detail="Comment not found")

    existing = session.exec(
        select(Reaction).where(
            Reaction.user_id == current_user.id,
            Reaction.post_id == payload.post_id,
            Reaction.comment_id == payload.comment_id
        )
    ).first()

    if existing:
        existing.reaction_type = ReactionType(payload.reaction_type)
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing

    reaction = Reaction(
        user_id=current_user.id,
        post_id=payload.post_id,
        comment_id=payload.comment_id,
        reaction_type=ReactionType(payload.reaction_type)
    )
    session.add(reaction)
    session.commit()
    session.refresh(reaction)

    return reaction


@router.delete("/reactions/{reaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_reaction(
    reaction_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    reaction = session.get(Reaction, reaction_id)
    if not reaction:
        raise HTTPException(status_code=404, detail="Reaction not found")

    if reaction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to remove this reaction")

    session.delete(reaction)
    session.commit()


@router.get("/reactions/posts/{post_id}")
def get_post_reactions(
    post_id: int,
    session: Session = Depends(get_session)
):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    stmt = (
        select(Reaction.reaction_type, func.count(Reaction.id).label("count"))
        .where(Reaction.post_id == post_id)
        .group_by(Reaction.reaction_type)
    )
    results = session.exec(stmt).all()

    reaction_counts = {r.reaction_type: r.count for r in results}
    total = sum(reaction_counts.values())

    return {
        "post_id": post_id,
        "total_reactions": total,
        "reactions": reaction_counts
    }


@router.get("/reactions/comments/{comment_id}")
def get_comment_reactions(
    comment_id: int,
    session: Session = Depends(get_session)
):
    comment = session.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    stmt = (
        select(Reaction.reaction_type, func.count(Reaction.id).label("count"))
        .where(Reaction.comment_id == comment_id)
        .group_by(Reaction.reaction_type)
    )
    results = session.exec(stmt).all()

    reaction_counts = {r.reaction_type: r.count for r in results}
    total = sum(reaction_counts.values())

    return {
        "comment_id": comment_id,
        "total_reactions": total,
        "reactions": reaction_counts
    }
