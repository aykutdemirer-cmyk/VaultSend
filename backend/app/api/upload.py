import os
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_sender_email
from app.core.security import generate_download_token, generate_storage_filename
from app.schemas.schemas import UploadInitIn, UploadInitOut, UploadCompleteIn, TransferOut
from app.models import Transfer
from app.services import settings_service, storage_service, audit_service, email_service

router = APIRouter(prefix="/api/upload", tags=["upload"])

CHUNK_SIZE = 8 * 1024 * 1024  # 8 MB


def _format_size(num_bytes: int) -> str:
    size = float(num_bytes)
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if size < 1024:
            return f"{size:.1f} {unit}"
        size /= 1024
    return f"{size:.1f} PB"


@router.post("/init", response_model=UploadInitOut)
async def init_upload(
    payload: UploadInitIn,
    sender_email: str = Depends(get_sender_email),
    db: Session = Depends(get_db),
):
    max_size_bytes = int(settings_service.get_setting(db, "max_file_size_gb") * 1024**3)
    if payload.file_size <= 0 or payload.file_size > max_size_bytes:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Dosya boyutu limiti aşıyor (maks {settings_service.get_setting(db, 'max_file_size_gb')} GB).")

    _, ext = os.path.splitext(payload.filename)
    blocked = settings_service.get_blocked_extensions(db)
    if ext.lower() in blocked:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Bu dosya türüne izin verilmiyor: {ext}")

    max_ttl = settings_service.get_setting(db, "max_link_ttl_hours")
    ttl_hours = min(payload.ttl_hours, max_ttl) if payload.ttl_hours else settings_service.get_setting(db, "default_link_ttl_hours")

    stored_filename = generate_storage_filename(ext)
    now = datetime.now(timezone.utc)

    transfer = Transfer(
        sender_email=sender_email,
        recipient_email=payload.recipient_email.lower(),
        filename=payload.filename,
        stored_filename=stored_filename,
        file_size=payload.file_size,
        download_token=generate_download_token(),
        max_downloads=settings_service.get_setting(db, "max_downloads"),
        expires_at=now + timedelta(hours=ttl_hours),
        status="UPLOADING",
        subject=(payload.subject or "").strip() or None,
        message=(payload.message or "").strip() or None,
    )
    db.add(transfer)
    db.commit()

    audit_service.log_action(db, sender_email, "UPLOAD_STARTED", "SUCCESS", resource=payload.filename)

    return UploadInitOut(upload_id=str(transfer.id), chunk_size=CHUNK_SIZE)


@router.get("/{upload_id}/status")
async def upload_status(
    upload_id: str,
    total_chunks: int,
    sender_email: str = Depends(get_sender_email),
    db: Session = Depends(get_db),
):
    transfer = _get_owned_transfer(db, upload_id, sender_email)
    received = [i for i in range(total_chunks) if storage_service.chunk_exists(str(transfer.id), i)]
    return {"received_chunks": received}


@router.put("/{upload_id}/chunk/{index}", status_code=status.HTTP_204_NO_CONTENT)
async def upload_chunk(
    upload_id: str,
    index: int,
    request: Request,
    sender_email: str = Depends(get_sender_email),
    db: Session = Depends(get_db),
):
    transfer = _get_owned_transfer(db, upload_id, sender_email)
    if transfer.status != "UPLOADING":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Transfer bu aşamada değil.")

    body = await request.body()
    storage_service.write_chunk(str(transfer.id), index, body)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{upload_id}/complete", response_model=TransferOut)
async def complete_upload(
    upload_id: str,
    payload: UploadCompleteIn,
    sender_email: str = Depends(get_sender_email),
    db: Session = Depends(get_db),
):
    transfer = _get_owned_transfer(db, upload_id, sender_email)
    if transfer.status != "UPLOADING":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Transfer bu aşamada değil.")

    transfer.status = "PROCESSING"
    db.commit()

    try:
        storage_service.assemble_chunks(str(transfer.id), payload.total_chunks, transfer.stored_filename)
    except Exception:
        transfer.status = "FAILED"
        db.commit()
        audit_service.log_action(db, sender_email, "FILE_UPLOADED", "FAILED", resource=transfer.filename)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Dosya birleştirilemedi.")

    transfer.status = "READY"
    db.commit()

    audit_service.log_action(db, sender_email, "FILE_UPLOADED", "SUCCESS", resource=transfer.filename)
    audit_service.log_action(db, sender_email, "TRANSFER_CREATED", "SUCCESS", resource=transfer.filename)

    from app.core.config import get_settings
    settings = get_settings()
    download_link = f"{settings.frontend_base_url}/d/{transfer.download_token}"

    await email_service.send_transfer_email(
        to_email=transfer.recipient_email,
        sender_email=transfer.sender_email,
        filename=transfer.filename,
        size_display=_format_size(transfer.file_size),
        download_url=download_link,
        expires_at_display=transfer.expires_at.strftime("%d.%m.%Y %H:%M"),
        subject=transfer.subject,
        message=transfer.message,
    )
    audit_service.log_action(db, "SYSTEM", "EMAIL_SENT", "SUCCESS", resource=transfer.recipient_email)

    return TransferOut.model_validate(transfer)


def _get_owned_transfer(db: Session, upload_id: str, sender_email: str) -> Transfer:
    try:
        transfer_uuid = uuid.UUID(upload_id)
    except ValueError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Transfer bulunamadı.")

    transfer = db.get(Transfer, transfer_uuid)
    if transfer is None or transfer.sender_email != sender_email:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Transfer bulunamadı.")
    return transfer
