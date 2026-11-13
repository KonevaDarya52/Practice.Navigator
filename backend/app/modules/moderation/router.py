import uuid
from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import Field, model_validator
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.core.db import get_db
from app.core.deps import require_roles
from app.core.schemas import CamelModel
from app.modules.auth.models import ROLE_MODERATOR, User
from app.modules.moderation.models import ModerationDecision
from app.modules.notifications.service import notify, students_with_notifications
from app.modules.organizations.models import ORG_APPROVED, ORG_PENDING, ORG_REJECTED, Organization
from app.modules.requests.models import (
    REQ_PENDING,
    REQ_PUBLISHED,
    REQ_REJECTED,
    REQ_RETURNED,
    PracticeRequest,
)
from app.modules.requests.schemas import RequestOut

router = APIRouter(prefix="/moderation", tags=["Модерация (вуз)"])
moderator_only = require_roles(ROLE_MODERATOR)


# ----- Схемы -----

class OwnerOut(CamelModel):
    full_name: str
    email: str


class OrganizationOut(CamelModel):
    id: uuid.UUID
    name: str
    inn: str
    website: str
    contact_phone: str
    status: str
    moderator_comment: str
    owner: OwnerOut
    created_at: datetime


class DecisionIn(CamelModel):
    decision: Literal["approve", "return", "reject"]
    comment: str = Field(default="", max_length=2000)

    @model_validator(mode="after")
    def comment_required(self):
        # Если вуз возвращает или отклоняет — компания должна понимать, что исправить
        if self.decision != "approve" and not self.comment.strip():
            raise ValueError("Напишите комментарий: что нужно исправить или почему отказ")
        return self


class SummaryOut(CamelModel):
    organizations_pending: int
    requests_pending: int
    requests_published: int


# ----- Эндпоинты -----

@router.get("/summary", response_model=SummaryOut, summary="Сколько всего ждёт решения")
def summary(_: User = Depends(moderator_only), db: Session = Depends(get_db)):
    count_orgs = select(func.count()).select_from(Organization).where(Organization.status == ORG_PENDING)
    count_req = lambda s: select(func.count()).select_from(PracticeRequest).where(PracticeRequest.status == s)  # noqa: E731
    return SummaryOut(
        organizations_pending=db.scalar(count_orgs),
        requests_pending=db.scalar(count_req(REQ_PENDING)),
        requests_published=db.scalar(count_req(REQ_PUBLISHED)),
    )


@router.get("/organizations", response_model=list[OrganizationOut], summary="Компании на проверке")
def list_organizations(
    status_filter: str = Query(ORG_PENDING, alias="status"),
    _: User = Depends(moderator_only),
    db: Session = Depends(get_db),
):
    query = (
        select(Organization)
        .options(joinedload(Organization.owner))
        .where(Organization.status == status_filter)
        .order_by(Organization.created_at)
    )
    return db.scalars(query).all()


@router.post("/organizations/{org_id}/decision", response_model=OrganizationOut, summary="Решение по компании")
def decide_organization(
    org_id: uuid.UUID,
    data: DecisionIn,
    moderator: User = Depends(moderator_only),
    db: Session = Depends(get_db),
):
    org = db.get(Organization, org_id)
    if org is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Компания не найдена")
    if data.decision == "return":
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Компанию можно только одобрить или отклонить")

    org.status = ORG_APPROVED if data.decision == "approve" else ORG_REJECTED
    org.moderator_comment = data.comment.strip()
    db.add(ModerationDecision(target_type="organization", target_id=org.id, decision=data.decision,
                              comment=org.moderator_comment, moderator_id=moderator.id))
    if org.status == ORG_APPROVED:
        notify(db, [org.owner_id], "Вуз одобрил вашу компанию", "Теперь можно отправлять заявки на модерацию", "/company")
    else:
        notify(db, [org.owner_id], "Вуз отклонил вашу компанию", org.moderator_comment, "/company")
    db.commit()
    db.refresh(org)
    return org


@router.get("/requests", response_model=list[RequestOut], summary="Заявки на модерации")
def list_requests(
    status_filter: str = Query(REQ_PENDING, alias="status"),
    _: User = Depends(moderator_only),
    db: Session = Depends(get_db),
):
    query = (
        select(PracticeRequest)
        .options(joinedload(PracticeRequest.organization))
        .where(PracticeRequest.status == status_filter)
        .order_by(PracticeRequest.updated_at)
    )
    return db.scalars(query).all()


@router.post("/requests/{request_id}/decision", response_model=RequestOut, summary="Решение по заявке")
def decide_request(
    request_id: uuid.UUID,
    data: DecisionIn,
    moderator: User = Depends(moderator_only),
    db: Session = Depends(get_db),
):
    request = db.get(PracticeRequest, request_id)
    if request is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Заявка не найдена")
    if request.status != REQ_PENDING:
        raise HTTPException(status.HTTP_409_CONFLICT, "Эта заявка не ждёт модерации")

    request.status = {"approve": REQ_PUBLISHED, "return": REQ_RETURNED, "reject": REQ_REJECTED}[data.decision]
    request.moderator_comment = data.comment.strip()
    db.add(ModerationDecision(target_type="request", target_id=request.id, decision=data.decision,
                              comment=request.moderator_comment, moderator_id=moderator.id))
    titles = {
        REQ_PUBLISHED: "Заявка опубликована",
        REQ_RETURNED: "Заявка возвращена на доработку",
        REQ_REJECTED: "Заявка отклонена",
    }
    notify(db, [request.organization.owner_id], f"{titles[request.status]}: «{request.title}»", request.moderator_comment, "/company")
    if request.status == REQ_PUBLISHED:
        notify(db, students_with_notifications(db), f"Новая практика: «{request.title}»", request.organization.name, "/")
    db.commit()
    db.refresh(request)
    return request
