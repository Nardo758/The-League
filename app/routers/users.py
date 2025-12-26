from datetime import datetime
from typing import List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func

from app.db import get_session
from app.deps import get_current_user, get_current_user_optional
from app.schemas import UserRead
from app.models import User, UserFollow, Registration, Season, League, OnlineGame, Game, VenueMember


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


class MyLeagueItem(BaseModel):
    id: int
    name: str
    sport_name: str | None = None
    venue_name: str | None = None
    role: str
    status: str
    wins: int = 0
    losses: int = 0


class MyScheduleItem(BaseModel):
    id: int
    game_type: str
    opponent: str | None = None
    scheduled_at: datetime | None = None
    status: str
    league_name: str | None = None


class MyStatsResponse(BaseModel):
    total_games: int
    wins: int
    losses: int
    win_rate: float
    online_games_played: int
    leagues_joined: int


@router.get("/me/leagues", response_model=dict)
def get_my_leagues(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    registrations = session.exec(
        select(Registration)
        .where(Registration.user_id == current_user.id)
        .where(Registration.status == "approved")
    ).all()
    
    leagues_data = []
    for reg in registrations:
        season = session.get(Season, reg.season_id)
        if season:
            league = session.get(League, season.league_id)
            if league:
                leagues_data.append({
                    "id": league.id,
                    "name": league.name,
                    "season_id": season.id,
                    "season_name": season.name,
                    "status": season.status if hasattr(season, 'status') else "active",
                    "role": "participant"
                })
    
    venue_memberships = session.exec(
        select(VenueMember)
        .where(VenueMember.user_id == current_user.id)
    ).all()
    
    for membership in venue_memberships:
        leagues_data.append({
            "venue_id": membership.venue_id,
            "role": membership.role,
            "type": "venue_membership"
        })
    
    return {"items": leagues_data, "total": len(leagues_data)}


@router.get("/me/schedule", response_model=dict)
def get_my_schedule(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    from sqlalchemy import or_
    online_games = session.exec(
        select(OnlineGame)
        .where(
            or_(
                OnlineGame.player1_id == current_user.id,
                OnlineGame.player2_id == current_user.id
            )
        )
        .where(OnlineGame.status.in_(["waiting", "in_progress"]))
        .limit(20)
    ).all()
    
    schedule = []
    for game in online_games:
        opponent_id = game.player2_id if game.player1_id == current_user.id else game.player1_id
        schedule.append({
            "id": game.id,
            "game_type": game.game_type,
            "opponent_id": opponent_id,
            "status": game.status,
            "created_at": game.created_at.isoformat() if game.created_at else None
        })
    
    return {"items": schedule, "total": len(schedule)}


@router.get("/me/stats", response_model=MyStatsResponse)
def get_my_stats(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    from sqlalchemy import or_
    online_games = session.exec(
        select(OnlineGame)
        .where(
            or_(
                OnlineGame.player1_id == current_user.id,
                OnlineGame.player2_id == current_user.id
            )
        )
    ).all()
    
    total_games = len(online_games)
    wins = sum(1 for g in online_games if g.winner_id == current_user.id)
    losses = sum(1 for g in online_games if g.status == "completed" and g.winner_id and g.winner_id != current_user.id)
    
    registrations_count = session.exec(
        select(func.count(Registration.id))
        .where(Registration.user_id == current_user.id)
        .where(Registration.status == "approved")
    ).one()
    
    win_rate = (wins / total_games * 100) if total_games > 0 else 0.0
    
    return MyStatsResponse(
        total_games=total_games,
        wins=wins,
        losses=losses,
        win_rate=round(win_rate, 1),
        online_games_played=total_games,
        leagues_joined=registrations_count
    )

