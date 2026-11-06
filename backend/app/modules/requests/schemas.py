import uuid
from datetime import date, datetime

from pydantic import Field, model_validator

from app.core.schemas import CamelModel


class RequestIn(CamelModel):
    """Что компания указывает в заявке (слайд «Анкета и заявка компании»)."""

    title: str = Field(min_length=3, max_length=255)
    description: str = Field(default="", max_length=3000)
    practice_type: str = Field(default="Производственная", max_length=50)
    directions: list[str] = Field(default_factory=list, max_length=20)
    courses: list[int] = Field(default_factory=list, max_length=6)
    places: int = Field(default=1, ge=1, le=100)
    date_from: date | None = None
    date_to: date | None = None
    deadline: date | None = None
    format: str = Field(default="Офис", max_length=20)
    city: str = Field(default="", max_length=100)
    address: str = Field(default="", max_length=255)
    paid: bool = False
    tasks: list[str] = Field(default_factory=list, max_length=30)
    required_skills: list[str] = Field(default_factory=list, max_length=30)
    desired_skills: list[str] = Field(default_factory=list, max_length=30)
    mentor: str = Field(default="", max_length=255)

    @model_validator(mode="after")
    def check_dates(self):
        if self.date_from and self.date_to and self.date_to < self.date_from:
            raise ValueError("Дата окончания практики раньше даты начала")
        if self.deadline and self.date_from and self.deadline > self.date_from:
            raise ValueError("Дедлайн откликов должен быть не позже начала практики")
        return self


class OrganizationRef(CamelModel):
    id: uuid.UUID
    name: str


class RequestOut(RequestIn):
    id: uuid.UUID
    status: str
    moderator_comment: str
    organization: OrganizationRef
    created_at: datetime
    updated_at: datetime
