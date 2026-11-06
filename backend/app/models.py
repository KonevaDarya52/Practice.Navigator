"""Все таблицы приложения в одном месте — их видит Alembic при создании миграций."""

from app.core.db import Base
from app.modules.auth.models import User
from app.modules.dictionaries.models import Direction, Skill
from app.modules.moderation.models import ModerationDecision
from app.modules.organizations.models import Organization
from app.modules.profiles.models import StudentProfile
from app.modules.requests.models import PracticeRequest

__all__ = [
    "Base",
    "Direction",
    "ModerationDecision",
    "Organization",
    "PracticeRequest",
    "Skill",
    "StudentProfile",
    "User",
]
