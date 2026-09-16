"""add subject/message to transfers

Revision ID: 0002
Revises: 0001
Create Date: 2026-09-16

"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("transfers", sa.Column("subject", sa.String(255), nullable=True))
    op.add_column("transfers", sa.Column("message", sa.Text, nullable=True))


def downgrade() -> None:
    op.drop_column("transfers", "message")
    op.drop_column("transfers", "subject")
