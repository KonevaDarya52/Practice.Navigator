import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base
from app.core.models import TimestampMixin
from app.modules.auth.models import User


class StudentProfile(Base, TimestampMixin):
    """Анкета студента (слайд «Анкета и заявка компании»).

    Простые поля — отдельные колонки. Списки (навыки, языки, опыт, достижения)
    пока лежат в JSONB; в спринте 3 навыки вынесем в отдельную таблицу для подбора.
    ФИО и email хранятся в таблице users.
    """

    __tablename__ = "student_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    user: Mapped[User] = relationship()

    # Личные данные
    status: Mapped[str] = mapped_column(String(100), default="Студент ТИУ")
    open_to_offers: Mapped[bool] = mapped_column(default=True)
    photo: Mapped[str] = mapped_column(Text, default="")  # картинка в формате data URL
    birth_date: Mapped[date | None] = mapped_column(Date)
    phone: Mapped[str] = mapped_column(String(32), default="")
    city: Mapped[str] = mapped_column(String(100), default="")

    # Учёба
    university: Mapped[str] = mapped_column(String(255), default="Тюменский индустриальный университет")
    faculty: Mapped[str] = mapped_column(String(100), default="")
    direction: Mapped[str] = mapped_column(String(255), default="")
    course: Mapped[int] = mapped_column(default=1)
    group: Mapped[str] = mapped_column("study_group", String(50), default="")
    education_level: Mapped[str] = mapped_column(String(50), default="Бакалавриат")
    education_form: Mapped[str] = mapped_column(String(50), default="Очная")
    education_period: Mapped[str] = mapped_column(String(50), default="")
    gpa: Mapped[str] = mapped_column(String(10), default="")

    # Предпочтения
    practice_type: Mapped[str] = mapped_column(String(50), default="Производственная")
    format: Mapped[str] = mapped_column(String(20), default="Офис")
    preferred_city: Mapped[str] = mapped_column(String(100), default="")
    payment: Mapped[str] = mapped_column(String(20), default="Не важно")
    github: Mapped[str] = mapped_column(String(255), default="")
    resume: Mapped[str] = mapped_column(String(255), default="")

    # Списки
    technical_skills: Mapped[list] = mapped_column(JSONB, default=list)
    programming_languages: Mapped[list] = mapped_column(JSONB, default=list)
    foreign_languages: Mapped[list] = mapped_column(JSONB, default=list)
    interests: Mapped[list] = mapped_column(JSONB, default=list)
    experience: Mapped[list] = mapped_column(JSONB, default=list)
    achievements: Mapped[list] = mapped_column(JSONB, default=list)
