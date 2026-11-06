from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.schemas import CamelModel
from app.modules.dictionaries.models import Direction, Skill

router = APIRouter(prefix="/dictionaries", tags=["Справочники"])


class DirectionOut(CamelModel):
    code: str
    name: str


class SkillOut(CamelModel):
    name: str
    category: str


class DictionariesOut(CamelModel):
    directions: list[DirectionOut]
    skills: list[SkillOut]


@router.get("", response_model=DictionariesOut, summary="Направления и навыки")
def get_dictionaries(db: Session = Depends(get_db)):
    return DictionariesOut(
        directions=db.scalars(select(Direction).order_by(Direction.name)).all(),
        skills=db.scalars(select(Skill).order_by(Skill.category, Skill.name)).all(),
    )
