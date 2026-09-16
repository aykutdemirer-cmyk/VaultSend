from sqlalchemy.orm import Session

from app.models import AuditLog


def log_action(
    db: Session,
    actor: str,
    action: str,
    result: str,
    resource: str | None = None,
    ip_address: str | None = None,
    detail: str | None = None,
) -> None:
    entry = AuditLog(
        actor=actor,
        action=action,
        resource=resource,
        ip_address=ip_address,
        result=result,
        detail=detail,
    )
    db.add(entry)
    db.commit()
