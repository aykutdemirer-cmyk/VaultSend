from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models import Transfer
from app.services import settings_service, storage_service, audit_service


def expire_due_transfers(db: Session) -> int:
    now = datetime.now(timezone.utc)
    due = (
        db.query(Transfer)
        .filter(Transfer.status.in_(["READY", "DOWNLOADED"]), Transfer.expires_at < now)
        .all()
    )
    for transfer in due:
        transfer.status = "EXPIRED"
        audit_service.log_action(db, "SYSTEM", "TRANSFER_EXPIRED", "SUCCESS", resource=transfer.filename)
    db.commit()
    return len(due)


def delete_expired_files(db: Session) -> int:
    retention_hours = settings_service.get_setting(db, "expired_retention_hours")
    cutoff = datetime.now(timezone.utc) - timedelta(hours=retention_hours)

    candidates = (
        db.query(Transfer)
        .filter(Transfer.status == "EXPIRED", Transfer.updated_at < cutoff, Transfer.deleted_at.is_(None))
        .all()
    )
    for transfer in candidates:
        storage_service.delete_file(transfer.stored_filename)
        transfer.status = "DELETED"
        transfer.deleted_at = datetime.now(timezone.utc)
        audit_service.log_action(db, "SYSTEM", "FILE_DELETED", "SUCCESS", resource=transfer.filename)
    db.commit()
    return len(candidates)


def run_cleanup_cycle(db: Session) -> None:
    expire_due_transfers(db)
    delete_expired_files(db)
