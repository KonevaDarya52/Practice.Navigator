import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.core.models import TimestampMixin, new_uuid


class ModerationDecision(Base, TimestampMixin):
    """История решений вуза: кто, когда и что решил по компании или заявке."""

    __tablename__ = "moderation_decisions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=new_uuid)
    target_type: Mapped[str] = mapped_column(String(20))  # organization | request
    target_id: Mapped[uuid.UUID] = mapped_column(index=True)
    decision: Mapped[str] = mapped_column(String(20))  # approve | return | reject
    comment: Mapped[str] = mapped_column(Text, default="")
    moderator_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
