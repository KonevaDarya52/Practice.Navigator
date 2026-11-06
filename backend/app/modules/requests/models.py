import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base
from app.core.models import TimestampMixin, new_uuid
from app.modules.organizations.models import Organization

# Статусы заявки (слайд «Путь от заявки до закрепления»)
REQ_DRAFT = "draft"  # черновик
REQ_PENDING = "pending"  # на модерации
REQ_PUBLISHED = "published"  # опубликована
REQ_RETURNED = "returned"  # возвращена на доработку
REQ_REJECTED = "rejected"  # отклонена
REQ_CLOSED = "closed"  # набор закрыт


class PracticeRequest(Base, TimestampMixin):
    """Заявка компании на практикантов."""

    __tablename__ = "practice_requests"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=new_uuid)
    organization_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"), index=True
    )
    organization: Mapped[Organization] = relationship()

    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    practice_type: Mapped[str] = mapped_column(String(50), default="Производственная")
    directions: Mapped[list] = mapped_column(JSONB, default=list)  # направления подготовки
    courses: Mapped[list] = mapped_column(JSONB, default=list)  # для каких курсов
    places: Mapped[int] = mapped_column(default=1)
    date_from: Mapped[date | None] = mapped_column(Date)
    date_to: Mapped[date | None] = mapped_column(Date)
    deadline: Mapped[date | None] = mapped_column(Date)  # дедлайн откликов
    format: Mapped[str] = mapped_column(String(20), default="Офис")
    city: Mapped[str] = mapped_column(String(100), default="")
    address: Mapped[str] = mapped_column(String(255), default="")
    paid: Mapped[bool] = mapped_column(default=False)
    tasks: Mapped[list] = mapped_column(JSONB, default=list)  # задачи практиканта
    required_skills: Mapped[list] = mapped_column(JSONB, default=list)
    desired_skills: Mapped[list] = mapped_column(JSONB, default=list)
    mentor: Mapped[str] = mapped_column(String(255), default="")

    status: Mapped[str] = mapped_column(String(20), default=REQ_DRAFT, index=True)
    moderator_comment: Mapped[str] = mapped_column(Text, default="")
