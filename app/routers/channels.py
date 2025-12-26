from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlmodel import Session, select, func, col

from app.db import get_session
from app.deps import get_current_user, get_current_user_optional
from app.models import (
    Channel, ChannelFeedEntry, ChannelSubscription, ChannelContentType,
    Sport, SportCategory, User, League, Season, Game, GameStatus,
    OnlineGame, OnlineGameStatus, Tournament, TournamentStatus,
    Post, Venue, VenueSport
)

router = APIRouter(prefix="/channels", tags=["channels"])


class ChannelResponse(BaseModel):
    id: int
    sport_id: int
    slug: str
    title: str
    description: str | None
    emoji: str | None
    hero_image_url: str | None
    primary_color: str | None
    is_active: bool
    subscriber_count: int = 0
    live_events_count: int = 0
    upcoming_events_count: int = 0
    is_subscribed: bool = False


class ChannelListResponse(BaseModel):
    items: list[ChannelResponse]
    total: int


class ChannelFeedEntryResponse(BaseModel):
    id: int
    content_type: str
    title: str
    subtitle: str | None
    body: str | None
    image_url: str | None
    link_url: str | None
    reference_id: int | None
    reference_type: str | None
    priority: int
    is_pinned: bool
    is_featured: bool
    starts_at: datetime | None
    created_at: datetime


class ChannelFeedResponse(BaseModel):
    items: list[ChannelFeedEntryResponse]
    total: int


class LiveEventResponse(BaseModel):
    id: int
    event_type: str
    title: str
    subtitle: str | None
    status: str
    venue_name: str | None = None
    started_at: datetime | None


class UpcomingEventResponse(BaseModel):
    id: int
    event_type: str
    title: str
    venue_name: str | None
    location: str | None
    starts_at: datetime | None
    registration_open: bool = False
    spots_available: int | None = None


class ChannelStatsResponse(BaseModel):
    subscriber_count: int
    live_events_count: int
    upcoming_events_count: int
    total_leagues: int
    total_venues: int
    recent_results_count: int


class ChannelDetailResponse(BaseModel):
    channel: ChannelResponse
    stats: ChannelStatsResponse
    live_events: list[LiveEventResponse]
    upcoming_events: list[UpcomingEventResponse]


class SubscriptionCreate(BaseModel):
    notify_live_events: bool = True
    notify_upcoming: bool = True
    notify_results: bool = True
    notify_posts: bool = False
    location_radius_miles: int | None = None


class SubscriptionResponse(BaseModel):
    id: int
    channel_id: int
    user_id: int
    notify_live_events: bool
    notify_upcoming: bool
    notify_results: bool
    notify_posts: bool
    location_radius_miles: int | None


def get_sport_category_for_channel(slug: str) -> SportCategory | None:
    mapping = {
        "golf": SportCategory.golf,
        "pickleball": SportCategory.pickleball,
        "bowling": SportCategory.bowling,
        "softball": SportCategory.softball,
        "tennis": SportCategory.tennis,
        "soccer": SportCategory.soccer,
        "chess": SportCategory.chess,
        "checkers": SportCategory.checkers,
    }
    return mapping.get(slug)


@router.get("", response_model=ChannelListResponse)
def list_channels(
    session: Session = Depends(get_session),
    current_user: User | None = Depends(get_current_user_optional),
    skip: int = 0,
    limit: int = 20,
    active_only: bool = True
):
    query = select(Channel)
    if active_only:
        query = query.where(Channel.is_active == True)
    query = query.offset(skip).limit(limit)
    
    channels = session.exec(query).all()
    total = session.exec(select(func.count(Channel.id)).where(Channel.is_active == True)).one()
    
    items = []
    for channel in channels:
        sub_count = session.exec(
            select(func.count(ChannelSubscription.id))
            .where(ChannelSubscription.channel_id == channel.id)
        ).one()
        
        is_subscribed = False
        if current_user:
            sub = session.exec(
                select(ChannelSubscription)
                .where(ChannelSubscription.channel_id == channel.id)
                .where(ChannelSubscription.user_id == current_user.id)
            ).first()
            is_subscribed = sub is not None
        
        items.append(ChannelResponse(
            id=channel.id,
            sport_id=channel.sport_id,
            slug=channel.slug,
            title=channel.title,
            description=channel.description,
            emoji=channel.emoji,
            hero_image_url=channel.hero_image_url,
            primary_color=channel.primary_color,
            is_active=channel.is_active,
            subscriber_count=sub_count,
            is_subscribed=is_subscribed
        ))
    
    return ChannelListResponse(items=items, total=total)


@router.get("/{slug}", response_model=ChannelDetailResponse)
def get_channel(
    slug: str,
    session: Session = Depends(get_session),
    current_user: User | None = Depends(get_current_user_optional)
):
    channel = session.exec(
        select(Channel).where(Channel.slug == slug)
    ).first()
    
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    sport = session.get(Sport, channel.sport_id)
    if not sport:
        raise HTTPException(status_code=404, detail="Sport not found")
    
    sub_count = session.exec(
        select(func.count(ChannelSubscription.id))
        .where(ChannelSubscription.channel_id == channel.id)
    ).one()
    
    is_subscribed = False
    if current_user:
        sub = session.exec(
            select(ChannelSubscription)
            .where(ChannelSubscription.channel_id == channel.id)
            .where(ChannelSubscription.user_id == current_user.id)
        ).first()
        is_subscribed = sub is not None
    
    live_games = session.exec(
        select(Game)
        .join(Season)
        .join(League)
        .where(League.sport_id == sport.id)
        .where(Game.status == GameStatus.in_progress)
        .limit(10)
    ).all()
    
    live_events = []
    for game in live_games:
        season = session.get(Season, game.season_id)
        league = session.get(League, season.league_id) if season else None
        venue = session.get(Venue, league.venue_id) if league else None
        live_events.append(LiveEventResponse(
            id=game.id,
            event_type="game",
            title=f"Game #{game.id}",
            subtitle=league.name if league else None,
            status="in_progress",
            venue_name=venue.name if venue else None,
            started_at=game.start_time
        ))
    
    now = datetime.utcnow()
    next_14_days = now + timedelta(days=14)
    
    upcoming_games = session.exec(
        select(Game)
        .join(Season)
        .join(League)
        .where(League.sport_id == sport.id)
        .where(Game.status == GameStatus.scheduled)
        .where(Game.start_time >= now)
        .where(Game.start_time <= next_14_days)
        .order_by(Game.start_time)
        .limit(10)
    ).all()
    
    upcoming_events = []
    for game in upcoming_games:
        season = session.get(Season, game.season_id)
        league = session.get(League, season.league_id) if season else None
        venue = session.get(Venue, league.venue_id) if league else None
        upcoming_events.append(UpcomingEventResponse(
            id=game.id,
            event_type="game",
            title=f"Game #{game.id}",
            venue_name=venue.name if venue else None,
            location=venue.city if venue else None,
            starts_at=game.start_time,
            registration_open=False
        ))
    
    open_seasons = session.exec(
        select(Season)
        .join(League)
        .where(League.sport_id == sport.id)
        .where(Season.registration_open == True)
        .limit(5)
    ).all()
    
    for season in open_seasons:
        league = session.get(League, season.league_id)
        venue = session.get(Venue, league.venue_id) if league else None
        upcoming_events.append(UpcomingEventResponse(
            id=season.id,
            event_type="season",
            title=f"{league.name} - {season.name}" if league else season.name,
            venue_name=venue.name if venue else None,
            location=venue.city if venue else None,
            starts_at=season.start_date,
            registration_open=True,
            spots_available=league.max_participants if league else None
        ))
    
    total_leagues = session.exec(
        select(func.count(League.id)).where(League.sport_id == sport.id)
    ).one()
    
    total_venues = session.exec(
        select(func.count(func.distinct(VenueSport.venue_id)))
        .where(VenueSport.sport_id == sport.id)
    ).one()
    
    recent_results = session.exec(
        select(func.count(Game.id))
        .join(Season)
        .join(League)
        .where(League.sport_id == sport.id)
        .where(Game.status == GameStatus.final)
    ).one()
    
    stats = ChannelStatsResponse(
        subscriber_count=sub_count,
        live_events_count=len(live_events),
        upcoming_events_count=len(upcoming_events),
        total_leagues=total_leagues,
        total_venues=total_venues,
        recent_results_count=recent_results
    )
    
    channel_response = ChannelResponse(
        id=channel.id,
        sport_id=channel.sport_id,
        slug=channel.slug,
        title=channel.title,
        description=channel.description,
        emoji=channel.emoji,
        hero_image_url=channel.hero_image_url,
        primary_color=channel.primary_color,
        is_active=channel.is_active,
        subscriber_count=sub_count,
        live_events_count=len(live_events),
        upcoming_events_count=len(upcoming_events),
        is_subscribed=is_subscribed
    )
    
    return ChannelDetailResponse(
        channel=channel_response,
        stats=stats,
        live_events=live_events,
        upcoming_events=upcoming_events
    )


@router.get("/{slug}/feed", response_model=ChannelFeedResponse)
def get_channel_feed(
    slug: str,
    session: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 20,
    content_type: str | None = None
):
    channel = session.exec(
        select(Channel).where(Channel.slug == slug)
    ).first()
    
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    query = select(ChannelFeedEntry).where(ChannelFeedEntry.channel_id == channel.id)
    
    if content_type:
        query = query.where(ChannelFeedEntry.content_type == content_type)
    
    query = query.order_by(
        col(ChannelFeedEntry.is_pinned).desc(),
        col(ChannelFeedEntry.priority).desc(),
        col(ChannelFeedEntry.created_at).desc()
    ).offset(skip).limit(limit)
    
    entries = session.exec(query).all()
    
    total_query = select(func.count(ChannelFeedEntry.id)).where(
        ChannelFeedEntry.channel_id == channel.id
    )
    if content_type:
        total_query = total_query.where(ChannelFeedEntry.content_type == content_type)
    total = session.exec(total_query).one()
    
    items = [
        ChannelFeedEntryResponse(
            id=e.id,
            content_type=e.content_type,
            title=e.title,
            subtitle=e.subtitle,
            body=e.body,
            image_url=e.image_url,
            link_url=e.link_url,
            reference_id=e.reference_id,
            reference_type=e.reference_type,
            priority=e.priority,
            is_pinned=e.is_pinned,
            is_featured=e.is_featured,
            starts_at=e.starts_at,
            created_at=e.created_at
        )
        for e in entries
    ]
    
    return ChannelFeedResponse(items=items, total=total)


@router.post("/{slug}/subscribe", response_model=SubscriptionResponse)
def subscribe_to_channel(
    slug: str,
    subscription: SubscriptionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    channel = session.exec(
        select(Channel).where(Channel.slug == slug)
    ).first()
    
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    existing = session.exec(
        select(ChannelSubscription)
        .where(ChannelSubscription.channel_id == channel.id)
        .where(ChannelSubscription.user_id == current_user.id)
    ).first()
    
    if existing:
        existing.notify_live_events = subscription.notify_live_events
        existing.notify_upcoming = subscription.notify_upcoming
        existing.notify_results = subscription.notify_results
        existing.notify_posts = subscription.notify_posts
        existing.location_radius_miles = subscription.location_radius_miles
        existing.updated_at = datetime.utcnow()
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return SubscriptionResponse(
            id=existing.id,
            channel_id=existing.channel_id,
            user_id=existing.user_id,
            notify_live_events=existing.notify_live_events,
            notify_upcoming=existing.notify_upcoming,
            notify_results=existing.notify_results,
            notify_posts=existing.notify_posts,
            location_radius_miles=existing.location_radius_miles
        )
    
    new_sub = ChannelSubscription(
        channel_id=channel.id,
        user_id=current_user.id,
        notify_live_events=subscription.notify_live_events,
        notify_upcoming=subscription.notify_upcoming,
        notify_results=subscription.notify_results,
        notify_posts=subscription.notify_posts,
        location_radius_miles=subscription.location_radius_miles
    )
    session.add(new_sub)
    session.commit()
    session.refresh(new_sub)
    
    return SubscriptionResponse(
        id=new_sub.id,
        channel_id=new_sub.channel_id,
        user_id=new_sub.user_id,
        notify_live_events=new_sub.notify_live_events,
        notify_upcoming=new_sub.notify_upcoming,
        notify_results=new_sub.notify_results,
        notify_posts=new_sub.notify_posts,
        location_radius_miles=new_sub.location_radius_miles
    )


@router.delete("/{slug}/subscribe")
def unsubscribe_from_channel(
    slug: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    channel = session.exec(
        select(Channel).where(Channel.slug == slug)
    ).first()
    
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    sub = session.exec(
        select(ChannelSubscription)
        .where(ChannelSubscription.channel_id == channel.id)
        .where(ChannelSubscription.user_id == current_user.id)
    ).first()
    
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    session.delete(sub)
    session.commit()
    
    return {"message": "Unsubscribed successfully"}


@router.get("/{slug}/subscription", response_model=SubscriptionResponse | None)
def get_subscription(
    slug: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    channel = session.exec(
        select(Channel).where(Channel.slug == slug)
    ).first()
    
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    sub = session.exec(
        select(ChannelSubscription)
        .where(ChannelSubscription.channel_id == channel.id)
        .where(ChannelSubscription.user_id == current_user.id)
    ).first()
    
    if not sub:
        return None
    
    return SubscriptionResponse(
        id=sub.id,
        channel_id=sub.channel_id,
        user_id=sub.user_id,
        notify_live_events=sub.notify_live_events,
        notify_upcoming=sub.notify_upcoming,
        notify_results=sub.notify_results,
        notify_posts=sub.notify_posts,
        location_radius_miles=sub.location_radius_miles
    )
