from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Transfer, DownloadLog
from app.schemas.schemas import PublicDownloadOut
from app.services import storage_service, audit_service

router = APIRouter(prefix="/api/d", tags=["download"])


def _get_transfer_by_token(db: Session, token: str) -> Transfer:
    transfer = db.query(Transfer).filter(Transfer.download_token == token).first()
    if transfer is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Bağlantı bulunamadı.")
    return transfer


def _is_expired(transfer: Transfer) -> bool:
    if transfer.status in ("EXPIRED", "DELETED", "FAILED"):
        return True
    if transfer.expires_at < datetime.now(timezone.utc):
        return True
    if transfer.max_downloads and transfer.download_count >= transfer.max_downloads:
        return True
    return False


@router.get("/{token}", response_model=PublicDownloadOut)
async def get_transfer_info(token: str, db: Session = Depends(get_db)):
    transfer = _get_transfer_by_token(db, token)
    if _is_expired(transfer) and transfer.status not in ("EXPIRED", "DELETED"):
        transfer.status = "EXPIRED"
        db.commit()
    return PublicDownloadOut(
        filename=transfer.filename,
        file_size=transfer.file_size,
        sender_email=transfer.sender_email,
        message=transfer.message,
        expires_at=transfer.expires_at,
        status=transfer.status,
        download_count=transfer.download_count,
        max_downloads=transfer.max_downloads,
    )


@router.get("/{token}/file")
async def download_file(token: str, request: Request, db: Session = Depends(get_db)):
    transfer = _get_transfer_by_token(db, token)
    ip = request.client.host if request.client else None

    if _is_expired(transfer):
        if transfer.status not in ("EXPIRED", "DELETED"):
            transfer.status = "EXPIRED"
            db.commit()
        db.add(DownloadLog(transfer_id=transfer.id, ip_address=ip, result="EXPIRED"))
        db.commit()
        audit_service.log_action(db, "EXTERNAL", "FILE_DOWNLOAD_BLOCKED", "EXPIRED", resource=transfer.filename, ip_address=ip)
        raise HTTPException(status.HTTP_410_GONE, "Bu dosyanın indirme bağlantısının süresi dolmuştur.")

    if not storage_service.file_exists(transfer.stored_filename):
        db.add(DownloadLog(transfer_id=transfer.id, ip_address=ip, result="FAILED_MISSING_FILE"))
        db.commit()
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Dosya bulunamadı.")

    transfer.download_count += 1
    if transfer.status == "READY":
        transfer.status = "DOWNLOADED"
    db.add(DownloadLog(transfer_id=transfer.id, ip_address=ip, result="SUCCESS"))
    db.commit()
    audit_service.log_action(db, "EXTERNAL", "FILE_DOWNLOADED", "SUCCESS", resource=transfer.filename, ip_address=ip)

    return FileResponse(
        storage_service.file_path(transfer.stored_filename),
        filename=transfer.filename,
        media_type="application/octet-stream",
    )
