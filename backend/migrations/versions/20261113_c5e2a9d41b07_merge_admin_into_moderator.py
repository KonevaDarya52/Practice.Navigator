"""Роль admin объединена с moderator

У админа не было своих прав — он делал то же, что модератор.
Оставляем одну роль «модератор» и одну учётку — с заполненными данными.

Revision ID: c5e2a9d41b07
Revises: b81d4c2e9f13
Create Date: 2026-11-13 10:00:00
"""
from typing import Sequence, Union

from alembic import op

revision: str = 'c5e2a9d41b07'
down_revision: Union[str, None] = 'b81d4c2e9f13'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Модератор, которому переходят решения админов: сначала основная учётка вуза, иначе самый ранний модератор
KEEPER = """
    SELECT id FROM users WHERE role = 'moderator'
    ORDER BY (email = 'moderator@tyuiu.ru') DESC, created_at
    LIMIT 1
"""


def upgrade() -> None:
    # Если модераторов нет вообще — админы просто становятся модераторами, удалять некого
    op.execute("""
        UPDATE users SET role = 'moderator'
        WHERE role = 'admin' AND NOT EXISTS (SELECT 1 FROM users WHERE role = 'moderator')
    """)
    # Решения модерации, принятые админами, сохраняем за модератором
    op.execute(f"""
        UPDATE moderation_decisions SET moderator_id = ({KEEPER})
        WHERE moderator_id IN (SELECT id FROM users WHERE role = 'admin')
    """)
    # Учётки админов удаляем (их уведомления удалятся вместе с ними — у модератора есть такие же)
    op.execute("DELETE FROM users WHERE role = 'admin'")


def downgrade() -> None:
    # Удалённые учётки не восстанавливаем: роль admin больше не поддерживается кодом
    pass
