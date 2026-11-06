from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import require_roles
from app.modules.auth.models import ROLE_STUDENT, User
from app.modules.profiles.models import StudentProfile
from app.modules.profiles.schemas import ProfileData

router = APIRouter(prefix="/profile", tags=["Профиль студента"])

# Колонки анкеты, которые один в один совпадают с полями схемы
SIMPLE_FIELDS = (
    "status", "open_to_offers", "photo", "phone", "city",
    "university", "faculty", "direction", "course", "group",
    "education_level", "education_form", "education_period", "gpa",
    "practice_type", "format", "preferred_city", "payment", "github", "resume",
)
LIST_FIELDS = (
    "technical_skills", "programming_languages", "foreign_languages",
    "interests", "experience", "achievements",
)


def get_or_create_profile(db: Session, user: User) -> StudentProfile:
    profile = db.get(StudentProfile, user.id)
    if profile is None:
        profile = StudentProfile(user_id=user.id)
        db.add(profile)
        db.flush()
    return profile


def to_schema(user: User, profile: StudentProfile) -> ProfileData:
    data = {field: getattr(profile, field) for field in SIMPLE_FIELDS + LIST_FIELDS}
    return ProfileData(
        **data,
        full_name=user.full_name,
        email=user.email,
        birth_date=profile.birth_date.isoformat() if profile.birth_date else "",
    )


@router.get("/me", response_model=ProfileData, summary="Мой профиль")
def get_my_profile(user: User = Depends(require_roles(ROLE_STUDENT)), db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user)
    db.commit()
    return to_schema(user, profile)


@router.put("/me", response_model=ProfileData, summary="Сохранить мой профиль")
def update_my_profile(
    data: ProfileData,
    user: User = Depends(require_roles(ROLE_STUDENT)),
    db: Session = Depends(get_db),
):
    email = data.email.lower()
    if email != user.email and db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status.HTTP_409_CONFLICT, "Эта почта уже занята другим пользователем")

    profile = get_or_create_profile(db, user)
    for field in SIMPLE_FIELDS:
        setattr(profile, field, getattr(data, field))
    for field in LIST_FIELDS:
        value = getattr(data, field)
        # Списки схем превращаем в обычные словари для JSONB
        setattr(profile, field, [item.model_dump(by_alias=True) if hasattr(item, "model_dump") else item for item in value])
    profile.birth_date = date.fromisoformat(data.birth_date) if data.birth_date else None

    user.full_name = data.full_name
    user.email = email
    db.commit()
    return to_schema(user, profile)
