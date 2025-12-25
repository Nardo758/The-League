from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select

from app.db import get_session
from app.deps import get_current_user
from app.models import Notification, NotificationType, User
from app.schemas import NotificationRead, PaginatedResponse, paginate

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=PaginatedResponse[NotificationRead])
def list_notifications(
    unread_only: bool = Query(False),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Notification).where(Notification.user_id == current_user.id)
    count_stmt = select(func.count()).select_from(Notification).where(
        Notification.user_id == current_user.id
    )

    if unread_only:
        stmt = stmt.where(Notification.is_read == False)
        count_stmt = count_stmt.where(Notification.is_read == False)

    total = session.exec(count_stmt).one()

    stmt = stmt.order_by(Notification.created_at.desc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    items = [NotificationRead.model_validate(n) for n in session.exec(stmt).all()]
    return paginate(items, total, page, page_size)


@router.get("/unread-count")
def get_unread_count(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    count = session.exec(
        select(func.count()).select_from(Notification).where(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
    ).one()

    return {"unread_count": count}


@router.post("/{notification_id}/read", response_model=NotificationRead)
def mark_as_read(
    notification_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    notification = session.get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    notification.is_read = True
    session.add(notification)
    session.commit()
    session.refresh(notification)

    return notification


@router.post("/mark-all-read")
def mark_all_as_read(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    notifications = session.exec(
        select(Notification).where(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
    ).all()

    count = 0
    for n in notifications:
        n.is_read = True
        session.add(n)
        count += 1

    session.commit()

    return {"marked_read": count}


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notification_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    notification = session.get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    session.delete(notification)
    session.commit()


def create_notification(
    session: Session,
    user_id: int,
    notification_type: NotificationType,
    title: str,
    message: str,
    link: str | None = None,
    related_id: int | None = None,
    related_type: str | None = None
) -> Notification:
    notification = Notification(
        user_id=user_id,
        notification_type=notification_type,
        title=title,
        message=message,
        link=link,
        related_id=related_id,
        related_type=related_type
    )
    session.add(notification)
    session.commit()
    session.refresh(notification)
    return notification


def notify_league_participants(
    session: Session,
    league_id: int,
    notification_type: NotificationType,
    title: str,
    message: str,
    link: str | None = None
):
    from app.models import Registration, RegistrationStatus

    registrations = session.exec(
        select(Registration).where(
            Registration.league_id == league_id,
            Registration.status == RegistrationStatus.approved
        )
    ).all()

    for reg in registrations:
        create_notification(
            session=session,
            user_id=reg.user_id,
            notification_type=notification_type,
            title=title,
            message=message,
            link=link,
            related_id=league_id,
            related_type="league"
        )
