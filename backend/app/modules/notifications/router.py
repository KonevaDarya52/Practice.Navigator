import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user
from app.core.schemas import CamelModel
from app.modules.auth.models import User
from app.modules.notifications.models import Notification

router = APIRouter(prefix="/notifications", tags=["Уведомления"])


class NotificationOut(CamelModel):
    id: uuid.UUID
    title: str
    text: str
    link: str
    created_at: datetime
    read_at: datetime | None


class NotificationsOut(CamelModel):
    unread: int
    items: list[NotificationOut]


@router.get("", response_model=NotificationsOut, summary="Мои уведомления (последние 30)")
def list_notifications(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.scalars(
        select(Notification).where(Notification.user_id == user.id).order_by(Notification.created_at.desc()).limit(30)
    ).all()
    unread = db.scalar(
        select(func.count()).select_from(Notification).where(Notification.user_id == user.id, Notification.read_at.is_(None))
    )
    return NotificationsOut(unread=unread or 0, items=items)


@router.post("/{notification_id}/read", status_code=204, summary="Отметить уведомление прочитанным")
def mark_read(notification_id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.get(Notification, notification_id)
    if item is None or item.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Уведомление не найдено")
    if item.read_at is None:
        item.read_at = datetime.now(timezone.utc)
        db.commit()


@router.post("/read-all", status_code=204, summary="Отметить все уведомления прочитанными")
def mark_all_read(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.execute(
        update(Notification)
        .where(Notification.user_id == user.id, Notification.read_at.is_(None))
        .values(read_at=datetime.now(timezone.utc))
    )
    db.commit()
