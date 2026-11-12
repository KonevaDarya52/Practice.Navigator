"""Создание уведомлений. Вызывается из других модулей в момент события,
в той же транзакции: если действие не сохранится, не сохранится и уведомление."""

import uuid
from collections.abc import Iterable

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.auth.models import ROLE_ADMIN, ROLE_MODERATOR, ROLE_STUDENT, User
from app.modules.notifications.models import Notification
from app.modules.profiles.models import StudentProfile


def notify(db: Session, user_ids: Iterable[uuid.UUID], title: str, text: str = "", link: str = "") -> None:
    for user_id in set(user_ids):
        db.add(Notification(user_id=user_id, title=title[:255], text=text, link=link))


def moderator_ids(db: Session) -> list[uuid.UUID]:
    query = select(User.id).where(User.role.in_((ROLE_MODERATOR, ROLE_ADMIN)), User.is_active)
    return list(db.scalars(query))


def students_with_notifications(db: Session) -> list[uuid.UUID]:
    """Студенты, у которых включён переключатель «Уведомления»."""
    query = (
        select(User.id)
        .join(StudentProfile, StudentProfile.user_id == User.id)
        .where(User.role == ROLE_STUDENT, User.is_active, StudentProfile.notifications_enabled)
    )
    return list(db.scalars(query))
