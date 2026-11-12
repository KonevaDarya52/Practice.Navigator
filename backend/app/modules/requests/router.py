import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.db import get_db
from app.core.deps import get_current_user, require_roles
from app.modules.auth.models import ROLE_COMPANY, User
from app.modules.notifications.service import moderator_ids, notify
from app.modules.organizations.models import ORG_APPROVED, Organization
from app.modules.requests.models import (
    REQ_CLOSED,
    REQ_DRAFT,
    REQ_PENDING,
    REQ_PUBLISHED,
    REQ_RETURNED,
    PracticeRequest,
)
from app.modules.requests.schemas import RequestIn, RequestOut

# ---------------------------------------------------------------------------
# Опубликованные заявки — их видят студенты (и все вошедшие пользователи)
# ---------------------------------------------------------------------------
public_router = APIRouter(prefix="/requests", tags=["Заявки (для студентов)"])


@public_router.get("", response_model=list[RequestOut], summary="Опубликованные заявки")
def list_published(_: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = (
        select(PracticeRequest)
        .options(joinedload(PracticeRequest.organization))
        .where(PracticeRequest.status == REQ_PUBLISHED)
        .order_by(PracticeRequest.created_at.desc())
    )
    return db.scalars(query).all()


@public_router.get("/{request_id}", response_model=RequestOut, summary="Опубликованная заявка")
def get_published(request_id: uuid.UUID, _: User = Depends(get_current_user), db: Session = Depends(get_db)):
    request = db.get(PracticeRequest, request_id)
    if request is None or request.status != REQ_PUBLISHED:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Заявка не найдена")
    return request


# ---------------------------------------------------------------------------
# Заявки своей компании — для представителя компании
# ---------------------------------------------------------------------------
company_router = APIRouter(prefix="/company/requests", tags=["Заявки компании"])

EDITABLE = (REQ_DRAFT, REQ_RETURNED)  # что компания может менять


def my_organization(db: Session, user: User) -> Organization:
    org = db.scalar(select(Organization).where(Organization.owner_id == user.id))
    if org is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Организация не найдена")
    return org


def my_request(db: Session, user: User, request_id: uuid.UUID) -> PracticeRequest:
    org = my_organization(db, user)
    request = db.get(PracticeRequest, request_id)
    if request is None or request.organization_id != org.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Заявка не найдена")
    return request


company_only = require_roles(ROLE_COMPANY)


@company_router.get("", response_model=list[RequestOut], summary="Заявки моей компании")
def list_mine(user: User = Depends(company_only), db: Session = Depends(get_db)):
    org = my_organization(db, user)
    query = (
        select(PracticeRequest)
        .where(PracticeRequest.organization_id == org.id)
        .order_by(PracticeRequest.updated_at.desc())
    )
    return db.scalars(query).all()


@company_router.post("", response_model=RequestOut, status_code=201, summary="Создать черновик заявки")
def create(data: RequestIn, user: User = Depends(company_only), db: Session = Depends(get_db)):
    org = my_organization(db, user)
    request = PracticeRequest(**data.model_dump(), organization_id=org.id, status=REQ_DRAFT)
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


@company_router.put("/{request_id}", response_model=RequestOut, summary="Изменить заявку")
def update(request_id: uuid.UUID, data: RequestIn, user: User = Depends(company_only), db: Session = Depends(get_db)):
    request = my_request(db, user, request_id)
    if request.status not in EDITABLE:
        raise HTTPException(status.HTTP_409_CONFLICT, "Менять можно только черновик или заявку, возвращённую на доработку")
    for field, value in data.model_dump().items():
        setattr(request, field, value)
    db.commit()
    db.refresh(request)
    return request


@company_router.post("/{request_id}/submit", response_model=RequestOut, summary="Отправить заявку на модерацию")
def submit(request_id: uuid.UUID, user: User = Depends(company_only), db: Session = Depends(get_db)):
    request = my_request(db, user, request_id)
    # Компания не публикует заявки до проверки вузом (слайд «Роли и учётные записи»)
    if request.organization.status != ORG_APPROVED:
        raise HTTPException(status.HTTP_409_CONFLICT, "Вуз ещё не проверил вашу компанию — отправить заявку пока нельзя")
    if request.status not in EDITABLE:
        raise HTTPException(status.HTTP_409_CONFLICT, "Эта заявка уже на модерации или опубликована")
    request.status = REQ_PENDING
    notify(db, moderator_ids(db), "Заявка ждёт модерации", f"«{request.title}» — {request.organization.name}", "/moderation")
    db.commit()
    db.refresh(request)
    return request


@company_router.post("/{request_id}/close", response_model=RequestOut, summary="Закрыть набор")
def close(request_id: uuid.UUID, user: User = Depends(company_only), db: Session = Depends(get_db)):
    request = my_request(db, user, request_id)
    if request.status != REQ_PUBLISHED:
        raise HTTPException(status.HTTP_409_CONFLICT, "Закрыть набор можно только у опубликованной заявки")
    request.status = REQ_CLOSED
    db.commit()
    db.refresh(request)
    return request


@company_router.delete("/{request_id}", status_code=204, summary="Удалить черновик")
def delete(request_id: uuid.UUID, user: User = Depends(company_only), db: Session = Depends(get_db)):
    request = my_request(db, user, request_id)
    if request.status != REQ_DRAFT:
        raise HTTPException(status.HTTP_409_CONFLICT, "Удалить можно только черновик")
    db.delete(request)
    db.commit()
