"""Настройки профиля и уведомления

Revision ID: b81d4c2e9f13
Revises: a7c3e1f05b42
Create Date: 2026-11-12 14:00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'b81d4c2e9f13'
down_revision: Union[str, None] = 'a7c3e1f05b42'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('student_profiles', sa.Column('notifications_enabled', sa.Boolean(), server_default='true', nullable=False))
    op.add_column('student_profiles', sa.Column('contacts_after_response', sa.Boolean(), server_default='true', nullable=False))

    op.create_table('notifications',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('user_id', sa.Uuid(), nullable=False),
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('text', sa.Text(), nullable=False),
    sa.Column('link', sa.String(length=255), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'])


def downgrade() -> None:
    op.drop_index('ix_notifications_user_id', table_name='notifications')
    op.drop_table('notifications')
    op.drop_column('student_profiles', 'contacts_after_response')
    op.drop_column('student_profiles', 'notifications_enabled')
