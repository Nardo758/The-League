from datetime import datetime, timedelta
import logging
import asyncio
from typing import Any

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlmodel import Session, select

from app.db import engine
from app.models import League, Notification, NotificationType, Registration, RegistrationStatus, Season

logger = logging.getLogger(__name__)

scheduler: AsyncIOScheduler | None = None


def check_registration_deadlines():
    with Session(engine) as session:
        now = datetime.utcnow()
        reminder_window_start = now + timedelta(hours=24)
        reminder_window_end = now + timedelta(hours=48)
        
        seasons_with_deadlines = session.exec(
            select(Season).where(
                Season.registration_deadline.isnot(None),
                Season.registration_deadline > now,
                Season.registration_deadline >= reminder_window_start,
                Season.registration_deadline <= reminder_window_end,
                Season.is_active == True
            )
        ).all()
        
        for season in seasons_with_deadlines:
            if not season.registration_deadline:
                continue
                
            league = session.get(League, season.league_id)
            if not league:
                continue
            
            pending_registrations = session.exec(
                select(Registration).where(
                    Registration.season_id == season.id,
                    Registration.status == RegistrationStatus.pending
                )
            ).all()
            
            for reg in pending_registrations:
                existing = session.exec(
                    select(Notification).where(
                        Notification.user_id == reg.user_id,
                        Notification.notification_type == NotificationType.registration_deadline,
                        Notification.related_id == season.id,
                        Notification.related_type == "season"
                    )
                ).first()
                
                if existing:
                    continue
                
                hours_left = max(1, int((season.registration_deadline - now).total_seconds() / 3600))
                notification = Notification(
                    user_id=reg.user_id,
                    notification_type=NotificationType.registration_deadline,
                    title="Registration Deadline Approaching",
                    message=f"Registration for {league.name} closes in {hours_left} hours!",
                    link=f"/leagues/{league.id}",
                    related_id=season.id,
                    related_type="season"
                )
                session.add(notification)
                logger.info(f"Created deadline reminder for user {reg.user_id}, season {season.id}")
            
        session.commit()
        logger.info(f"Checked {len(seasons_with_deadlines)} seasons for deadline reminders")


def start_scheduler():
    global scheduler
    if scheduler is not None:
        try:
            if scheduler.running:
                logger.info("Scheduler already running, skipping start")
                return
        except Exception:
            pass
    
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None
    
    try:
        scheduler = AsyncIOScheduler(event_loop=loop)
        scheduler.add_job(
            check_registration_deadlines,
            trigger=IntervalTrigger(hours=6),
            id="check_registration_deadlines",
            name="Check registration deadlines and send reminders",
            replace_existing=True
        )
        scheduler.start()
        logger.info("Background scheduler started")
    except Exception as e:
        logger.error(f"Failed to start scheduler: {e}")
        scheduler = None


def stop_scheduler():
    global scheduler
    if scheduler is None:
        return
    
    try:
        if scheduler.running:
            scheduler.shutdown(wait=False)
            logger.info("Background scheduler stopped")
    except Exception as e:
        logger.warning(f"Error stopping scheduler: {e}")
    finally:
        scheduler = None
