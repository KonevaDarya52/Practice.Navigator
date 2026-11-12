from datetime import date
from pathlib import PurePath
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import require_roles
from app.modules.auth.models import ROLE_STUDENT, User
from app.modules.profiles.models import MAX_RESUME_BYTES, StudentProfile, StudentResume
from app.modules.profiles.schemas import ProfileData, SettingsIn

router = APIRouter(prefix="/profile", tags=["Профиль студента"])

# Колонки анкеты, которые один в один совпадают с полями схемы.
# resume (имя файла) сюда не входит: его меняют только эндпоинты /profile/me/resume
SIMPLE_FIELDS = (
    "status", "open_to_offers", "photo", "phone", "city",
    "university", "faculty", "direction", "course", "group",
    "education_level", "education_form", "education_period", "gpa",
    "practice_type", "format", "preferred_city", "payment", "github",
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
        resume=profile.resume,
        notifications_enabled=profile.notifications_enabled,
        contacts_after_response=profile.contacts_after_response,
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


@router.patch("/me/settings", response_model=ProfileData, summary="Изменить настройки профиля")
def update_settings(
    data: SettingsIn,
    user: User = Depends(require_roles(ROLE_STUDENT)),
    db: Session = Depends(get_db),
):
    profile = get_or_create_profile(db, user)
    if data.notifications_enabled is not None:
        profile.notifications_enabled = data.notifications_enabled
    if data.contacts_after_response is not None:
        profile.contacts_after_response = data.contacts_after_response
    db.commit()
    return to_schema(user, profile)


# ---------------------------------------------------------------------------
# Резюме (PDF до 5 МБ). Файл хранится в таблице student_resumes,
# имя файла — в student_profiles.resume, чтобы показывать его в профиле.
# ---------------------------------------------------------------------------

MAX_RESUME_MB = MAX_RESUME_BYTES // (1024 * 1024)


@router.post("/me/resume", response_model=ProfileData, summary="Загрузить резюме (PDF до 5 МБ)")
async def upload_resume(
    file: UploadFile,
    user: User = Depends(require_roles(ROLE_STUDENT)),
    db: Session = Depends(get_db),
):
    # Имя без папок (некоторые браузеры присылают полный путь)
    filename = PurePath((file.filename or "").replace("\\", "/")).name.strip()[:255]
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Резюме должно быть в формате PDF")

    # Читаем на 1 байт больше лимита: так узнаём о превышении, не загружая весь файл в память
    content = await file.read(MAX_RESUME_BYTES + 1)
    if len(content) > MAX_RESUME_BYTES:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, f"Файл больше {MAX_RESUME_MB} МБ — сожми PDF или убери лишние страницы"
        )
    if not content:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Файл пустой")
    # Расширение можно переименовать, поэтому проверяем и содержимое: любой PDF начинается с %PDF-
    if not content.startswith(b"%PDF-"):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Файл не похож на PDF — сохрани резюме в формате PDF")

    resume = db.get(StudentResume, user.id) or StudentResume(user_id=user.id)
    resume.filename = filename
    resume.content = content
    resume.size = len(content)
    db.add(resume)

    profile = get_or_create_profile(db, user)
    profile.resume = filename
    db.commit()
    return to_schema(user, profile)


@router.get("/me/resume", summary="Скачать моё резюме", response_class=Response)
def download_resume(user: User = Depends(require_roles(ROLE_STUDENT)), db: Session = Depends(get_db)):
    resume = db.get(StudentResume, user.id)
    if resume is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Резюме ещё не загружено")
    # inline — браузер откроет PDF во вкладке; имя в UTF-8, чтобы не ломалась кириллица
    disposition = f"inline; filename=\"resume.pdf\"; filename*=UTF-8''{quote(resume.filename)}"
    return Response(resume.content, media_type="application/pdf", headers={"Content-Disposition": disposition})


@router.delete("/me/resume", response_model=ProfileData, summary="Удалить резюме")
def delete_resume(user: User = Depends(require_roles(ROLE_STUDENT)), db: Session = Depends(get_db)):
    resume = db.get(StudentResume, user.id)
    if resume is not None:
        db.delete(resume)
    profile = get_or_create_profile(db, user)
    profile.resume = ""
    db.commit()
    return to_schema(user, profile)
