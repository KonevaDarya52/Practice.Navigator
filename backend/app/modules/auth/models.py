import uuid

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.core.models import TimestampMixin, new_uuid

# Роли пользователей (слайд «Роли и учётные записи»)
ROLE_STUDENT = "student"
ROLE_COMPANY = "company"
ROLE_MODERATOR = "moderator"  # сотрудник вуза: проверяет компании и заявки
ROLE_ADMIN = "admin"
ROLES = (ROLE_STUDENT, ROLE_COMPANY, ROLE_MODERATOR, ROLE_ADMIN)


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=new_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(default=True)
