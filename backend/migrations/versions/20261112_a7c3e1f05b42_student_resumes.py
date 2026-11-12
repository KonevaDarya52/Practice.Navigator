"""student_resumes: файл резюме студента

Revision ID: a7c3e1f05b42
Revises: 94206546dddc
Create Date: 2026-11-12 12:00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'a7c3e1f05b42'
down_revision: Union[str, None] = '94206546dddc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('student_resumes',
    sa.Column('user_id', sa.Uuid(), nullable=False),
    sa.Column('filename', sa.String(length=255), nullable=False),
    sa.Column('content', sa.LargeBinary(), nullable=False),
    sa.Column('size', sa.Integer(), nullable=False),
    sa.Column('uploaded_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('user_id')
    )
    # Раньше сохранялось только имя файла без самого файла — такие записи очищаем,
    # иначе в профиле будет «резюме», которое нельзя открыть
    op.execute("UPDATE student_profiles SET resume = '' WHERE resume <> ''")


def downgrade() -> None:
    op.drop_table('student_resumes')
