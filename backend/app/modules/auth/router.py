from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import get_db
from app.core.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.modules.auth.models import ROLE_COMPANY, ROLE_STUDENT, User
from app.modules.auth.schemas import (
    CompanyRegisterIn,
    LoginIn,
    OrganizationShort,
    StudentRegisterIn,
    TokenOut,
    UserOut,
)
from app.modules.organizations.models import Organization
from app.modules.profiles.models import StudentProfile

router = APIRouter(prefix="/auth", tags=["Вход и регистрация"])


def user_out(db: Session, user: User) -> UserOut:
    """Пользователь для ответа API; для компании добавляем её организацию."""
    out = UserOut.model_validate(user)
    if user.role == ROLE_COMPANY:
        org = db.scalar(select(Organization).where(Organization.owner_id == user.id))
        if org:
            out.organization = OrganizationShort.model_validate(org)
    return out


def token_out(db: Session, user: User) -> TokenOut:
    return TokenOut(access_token=create_access_token(user.id, user.role), user=user_out(db, user))


def ensure_email_free(db: Session, email: str) -> None:
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status.HTTP_409_CONFLICT, "Пользователь с такой почтой уже есть")


@router.post("/register/student", response_model=TokenOut, status_code=201, summary="Регистрация студента")
def register_student(data: StudentRegisterIn, db: Session = Depends(get_db)):
    email = data.email.lower()
    domain = settings.student_email_domain
    if domain and not email.endswith("@" + domain):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, f"Используй почту вуза (@{domain})")
    ensure_email_free(db, email)

    user = User(email=email, password_hash=hash_password(data.password), role=ROLE_STUDENT, full_name=data.full_name)
    db.add(user)
    db.flush()
    # Сразу создаём пустую анкету, студент заполнит её в профиле
    db.add(StudentProfile(user_id=user.id, status="Студент ТИУ"))
    db.commit()
    return token_out(db, user)


@router.post("/register/company", response_model=TokenOut, status_code=201, summary="Регистрация компании")
def register_company(data: CompanyRegisterIn, db: Session = Depends(get_db)):
    email = data.email.lower()
    ensure_email_free(db, email)
    if db.scalar(select(Organization).where(Organization.inn == data.inn)):
        raise HTTPException(status.HTTP_409_CONFLICT, "Компания с таким ИНН уже зарегистрирована")

    user = User(email=email, password_hash=hash_password(data.password), role=ROLE_COMPANY, full_name=data.full_name)
    db.add(user)
    db.flush()
    # Компания попадает на проверку вузу и не может публиковать заявки, пока её не одобрят
    db.add(
        Organization(
            name=data.organization_name.strip(),
            inn=data.inn,
            contact_phone=data.contact_phone.strip(),
            website=data.website.strip(),
            owner_id=user.id,
        )
    )
    db.commit()
    return token_out(db, user)


@router.post("/login", response_model=TokenOut, summary="Вход по почте и паролю")
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == data.email.lower()))
    if user is None or not verify_password(data.password, user.password_hash) or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Неверная почта или пароль")
    return token_out(db, user)


@router.get("/me", response_model=UserOut, summary="Текущий пользователь")
def me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return user_out(db, user)
