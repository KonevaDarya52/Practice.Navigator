import re
from typing import Literal

from pydantic import EmailStr, Field, field_validator

from app.core.schemas import CamelModel

# Поля совпадают с типом ProfileData во фронтенде (frontend/src/data/profile.ts)

MAX_PHOTO_LENGTH = 700_000  # ~500 КБ картинки в data URL


class Skill(CamelModel):
    name: str = Field(min_length=1, max_length=100)
    level: int = Field(ge=1, le=5)


class Language(CamelModel):
    name: str = Field(min_length=1, max_length=100)
    level: str = Field(max_length=30)


class Experience(CamelModel):
    title: str = Field(min_length=1, max_length=255)
    place: str = Field(default="", max_length=255)
    period: str = Field(default="", max_length=100)


class Achievement(CamelModel):
    kind: Literal["certificate", "course", "project", "conference"]
    title: str = Field(min_length=1, max_length=255)
    details: str = Field(default="", max_length=500)
    year: str = Field(default="", max_length=10)
    link: str | None = Field(default=None, max_length=500)


class ProfileData(CamelModel):
    # Личные данные
    full_name: str = Field(max_length=255)
    status: str = Field(default="", max_length=100)
    open_to_offers: bool = True
    photo: str = Field(default="", max_length=MAX_PHOTO_LENGTH)
    birth_date: str = ""  # ГГГГ-ММ-ДД или пустая строка
    email: EmailStr
    phone: str = Field(default="", max_length=32)
    city: str = Field(default="", max_length=100)

    # Учёба
    university: str = Field(default="", max_length=255)
    faculty: str = Field(default="", max_length=100)
    direction: str = Field(default="", max_length=255)
    course: int = Field(ge=1, le=6)
    group: str = Field(default="", max_length=50)
    education_level: str = Field(default="", max_length=50)
    education_form: str = Field(default="", max_length=50)
    education_period: str = Field(default="", max_length=50)
    gpa: str = Field(default="", max_length=10)

    # Предпочтения
    practice_type: str = Field(default="", max_length=50)
    format: str = Field(default="", max_length=20)
    preferred_city: str = Field(default="", max_length=100)
    payment: str = Field(default="", max_length=20)
    github: str = Field(default="", max_length=255)
    resume: str = Field(default="", max_length=255)

    # Списки
    technical_skills: list[Skill] = Field(default_factory=list, max_length=50)
    programming_languages: list[Language] = Field(default_factory=list, max_length=30)
    foreign_languages: list[Language] = Field(default_factory=list, max_length=20)
    interests: list[str] = Field(default_factory=list, max_length=30)
    experience: list[Experience] = Field(default_factory=list, max_length=30)
    achievements: list[Achievement] = Field(default_factory=list, max_length=50)

    @field_validator("full_name")
    @classmethod
    def check_full_name(cls, value: str) -> str:
        value = " ".join(value.split())
        if len(value.split(" ")) < 2:
            raise ValueError("Укажи фамилию и имя")
        return value

    @field_validator("phone")
    @classmethod
    def check_phone(cls, value: str) -> str:
        if value.strip() and len(re.sub(r"\D", "", value)) < 10:
            raise ValueError("В номере должно быть не меньше 10 цифр")
        return value.strip()

    @field_validator("birth_date")
    @classmethod
    def check_birth_date(cls, value: str) -> str:
        if value and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
            raise ValueError("Дата в формате ГГГГ-ММ-ДД")
        return value

    @field_validator("photo")
    @classmethod
    def check_photo(cls, value: str) -> str:
        if value and not value.startswith("data:image/"):
            raise ValueError("Фото должно быть картинкой")
        return value
