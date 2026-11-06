import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base
from app.core.models import TimestampMixin, new_uuid
from app.modules.auth.models import User

# Статусы проверки компании вузом
ORG_PENDING = "pending"
ORG_APPROVED = "approved"
ORG_REJECTED = "rejected"


class Organization(Base, TimestampMixin):
    __tablename__ = "organizations"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=new_uuid)
    name: Mapped[str] = mapped_column(String(255))
    inn: Mapped[str] = mapped_column(String(12), unique=True, index=True)
    website: Mapped[str] = mapped_column(String(255), default="")
    contact_phone: Mapped[str] = mapped_column(String(32), default="")
    status: Mapped[str] = mapped_column(String(20), default=ORG_PENDING, index=True)
    moderator_comment: Mapped[str] = mapped_column(Text, default="")

    # Представитель компании, который её зарегистрировал
    owner_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    owner: Mapped[User] = relationship()
