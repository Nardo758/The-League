from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func

from app.db import get_session
from app.deps import get_current_user, get_current_user_optional
from app.schemas import UserRead
from app.models import User, UserFollow


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead)
def me(current_user=Depends(get_current_user)):
    return current_user


class UserFollowCreate(BaseModel):
    notify_games: bool = True
    notify_achievements: bool = True
    notify_posts: bool = False


class UserFollowResponse(BaseModel):
    id: int
    follower_id: int
    following_id: int
    notify_games: bool
    notify_achievements: bool
    notify_posts: bool


class UserProfileResponse(BaseModel):
    id: int
    username: str | None = None
    full_name: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    follower_count: int
    following_count: int
    is_following: bool = False


@router.get("/{user_id}", response_model=UserProfileResponse)
def get_user_profile(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User | None = Depends(get_current_user_optional)
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    follower_count = session.exec(
        select(func.count(UserFollow.id))
        .where(UserFollow.following_id == user_id)
    ).one()
    
    following_count = session.exec(
        select(func.count(UserFollow.id))
        .where(UserFollow.follower_id == user_id)
    ).one()
    
    is_following = False
    if current_user:
        follow = session.exec(
            select(UserFollow)
            .where(UserFollow.follower_id == current_user.id)
            .where(UserFollow.following_id == user_id)
        ).first()
        is_following = follow is not None
    
    return UserProfileResponse(
        id=user.id,
        username=user.email.split('@')[0],
        full_name=user.full_name,
        bio=user.bio,
        avatar_url=user.avatar_url,
        follower_count=follower_count,
        following_count=following_count,
        is_following=is_following
    )


@router.post("/{user_id}/follow", response_model=UserFollowResponse)
def follow_user(
    user_id: int,
    prefs: UserFollowCreate = UserFollowCreate(),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    
    target_user = session.get(User, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    existing = session.exec(
        select(UserFollow)
        .where(UserFollow.follower_id == current_user.id)
        .where(UserFollow.following_id == user_id)
    ).first()
    
    if existing:
        existing.notify_games = prefs.notify_games
        existing.notify_achievements = prefs.notify_achievements
        existing.notify_posts = prefs.notify_posts
        existing.updated_at = datetime.utcnow()
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return UserFollowResponse(
            id=existing.id,
            follower_id=existing.follower_id,
            following_id=existing.following_id,
            notify_games=existing.notify_games,
            notify_achievements=existing.notify_achievements,
            notify_posts=existing.notify_posts
        )
    
    new_follow = UserFollow(
        follower_id=current_user.id,
        following_id=user_id,
        notify_games=prefs.notify_games,
        notify_achievements=prefs.notify_achievements,
        notify_posts=prefs.notify_posts
    )
    session.add(new_follow)
    session.commit()
    session.refresh(new_follow)
    
    return UserFollowResponse(
        id=new_follow.id,
        follower_id=new_follow.follower_id,
        following_id=new_follow.following_id,
        notify_games=new_follow.notify_games,
        notify_achievements=new_follow.notify_achievements,
        notify_posts=new_follow.notify_posts
    )


@router.delete("/{user_id}/follow")
def unfollow_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    follow = session.exec(
        select(UserFollow)
        .where(UserFollow.follower_id == current_user.id)
        .where(UserFollow.following_id == user_id)
    ).first()
    
    if not follow:
        raise HTTPException(status_code=404, detail="Not following this user")
    
    session.delete(follow)
    session.commit()
    
    return {"message": "Unfollowed user successfully"}


@router.get("/{user_id}/followers")
def get_user_followers(
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    session: Session = Depends(get_session)
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    follows = session.exec(
        select(UserFollow)
        .where(UserFollow.following_id == user_id)
        .offset(skip)
        .limit(limit)
    ).all()
    
    followers = []
    for follow in follows:
        follower = session.get(User, follow.follower_id)
        if follower:
            followers.append({
                "id": follower.id,
                "username": follower.email.split('@')[0],
                "full_name": follower.full_name,
                "avatar_url": follower.avatar_url
            })
    
    total = session.exec(
        select(func.count(UserFollow.id))
        .where(UserFollow.following_id == user_id)
    ).one()
    
    return {"items": followers, "total": total}


@router.get("/{user_id}/following")
def get_user_following(
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    session: Session = Depends(get_session)
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    follows = session.exec(
        select(UserFollow)
        .where(UserFollow.follower_id == user_id)
        .offset(skip)
        .limit(limit)
    ).all()
    
    following = []
    for follow in follows:
        followed_user = session.get(User, follow.following_id)
        if followed_user:
            following.append({
                "id": followed_user.id,
                "username": followed_user.email.split('@')[0],
                "full_name": followed_user.full_name,
                "avatar_url": followed_user.avatar_url
            })
    
    total = session.exec(
        select(func.count(UserFollow.id))
        .where(UserFollow.follower_id == user_id)
    ).one()
    
    return {"items": following, "total": total}

