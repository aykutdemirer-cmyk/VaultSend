import math
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_admin_email
from app.core.security import create_access_token, verify_password
from app.models import Transfer, AuditLog, AdminUser, DownloadLog
from app.schemas.schemas import AdminLoginIn, AdminSessionOut, SettingsIn, TestEmailIn
from app.services import audit_service, settings_service, email_service

router = APIRouter(prefix="/api/admin", tags=["admin"])

LOGIN_LOCKOUT_WINDOW_MINUTES = 15
LOGIN_MAX_FAILED_ATTEMPTS = 5


@router.post("/login", response_model=AdminSessionOut)
async def admin_login(payload: AdminLoginIn, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else None

    if ip:
        recent_failures = (
            db.query(AuditLog)
            .filter(
                AuditLog.action == "ADMIN_LOGIN",
                AuditLog.result == "FAILED",
                AuditLog.ip_address == ip,
                AuditLog.timestamp > datetime.now(timezone.utc) - timedelta(minutes=LOGIN_LOCKOUT_WINDOW_MINUTES),
            )
            .count()
        )
        if recent_failures >= LOGIN_MAX_FAILED_ATTEMPTS:
            audit_service.log_action(db, payload.email.lower(), "ADMIN_LOGIN", "LOCKED_OUT", ip_address=ip)
            raise HTTPException(
                status.HTTP_429_TOO_MANY_REQUESTS,
                "Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.",
            )

    admin = db.query(AdminUser).filter(AdminUser.email == payload.email.lower()).first()
    if admin is None or not verify_password(payload.password, admin.password_hash):
        audit_service.log_action(db, payload.email.lower(), "ADMIN_LOGIN", "FAILED", ip_address=ip)
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "E-mail veya parola hatalı.")

    audit_service.log_action(db, admin.email, "ADMIN_LOGIN", "SUCCESS", ip_address=ip)
    token = create_access_token(admin.email, "admin_session", expires_minutes=480)
    return AdminSessionOut(token=token)


@router.get("/dashboard")
async def dashboard(admin_email: str = Depends(get_admin_email), db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    total_transfers = db.query(func.count(Transfer.id)).scalar() or 0
    today_transfers = db.query(func.count(Transfer.id)).filter(Transfer.created_at >= today_start).scalar() or 0
    total_bytes = db.query(func.coalesce(func.sum(Transfer.file_size), 0)).scalar() or 0
    active_links = (
        db.query(func.count(Transfer.id))
        .filter(Transfer.status.in_(["READY", "DOWNLOADED"]), Transfer.expires_at > now)
        .scalar()
        or 0
    )

    recent = db.query(Transfer).order_by(Transfer.created_at.desc()).limit(10).all()

    return {
        "total_transfers": total_transfers,
        "today_transfers": today_transfers,
        "total_bytes": total_bytes,
        "active_links": active_links,
        "recent_transfers": [_transfer_to_dict(t) for t in recent],
    }


@router.get("/transfers")
async def list_transfers(
    admin_email: str = Depends(get_admin_email),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sender: str | None = None,
    recipient: str | None = None,
    filename: str | None = None,
    status_filter: str | None = Query(None, alias="status"),
    date_from: datetime | None = None,
    date_to: datetime | None = None,
):
    query = db.query(Transfer)
    if sender:
        query = query.filter(Transfer.sender_email.ilike(f"%{sender}%"))
    if recipient:
        query = query.filter(Transfer.recipient_email.ilike(f"%{recipient}%"))
    if filename:
        query = query.filter(Transfer.filename.ilike(f"%{filename}%"))
    if status_filter:
        query = query.filter(Transfer.status == status_filter)
    if date_from:
        query = query.filter(Transfer.created_at >= date_from)
    if date_to:
        query = query.filter(Transfer.created_at <= date_to)

    total = query.count()
    items = (
        query.order_by(Transfer.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "items": [_transfer_to_dict(t) for t in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": math.ceil(total / page_size) if total else 1,
    }


@router.get("/transfers/{transfer_id}")
async def transfer_detail(transfer_id: str, admin_email: str = Depends(get_admin_email), db: Session = Depends(get_db)):
    transfer = db.get(Transfer, transfer_id)
    if transfer is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Transfer bulunamadı.")

    audit_rows = (
        db.query(AuditLog)
        .filter(AuditLog.resource == transfer.filename)
        .order_by(AuditLog.timestamp.asc())
        .all()
    )
    downloads = db.query(DownloadLog).filter(DownloadLog.transfer_id == transfer.id).order_by(DownloadLog.created_at.asc()).all()

    activity = [
        {"timestamp": row.timestamp.isoformat(), "action": row.action, "result": row.result}
        for row in audit_rows
    ] + [
        {"timestamp": row.created_at.isoformat(), "action": "FILE_DOWNLOADED", "result": row.result}
        for row in downloads
    ]
    activity.sort(key=lambda x: x["timestamp"])

    return {**_transfer_to_dict(transfer), "activity": activity}


@router.get("/audit-log")
async def audit_log(
    admin_email: str = Depends(get_admin_email),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    action: str | None = None,
    actor: str | None = None,
):
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
    if actor:
        query = query.filter(AuditLog.actor.ilike(f"%{actor}%"))

    total = query.count()
    items = (
        query.order_by(AuditLog.timestamp.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "items": [
            {
                "id": str(row.id),
                "timestamp": row.timestamp.isoformat(),
                "actor": row.actor,
                "action": row.action,
                "resource": row.resource,
                "ip_address": row.ip_address,
                "result": row.result,
            }
            for row in items
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": math.ceil(total / page_size) if total else 1,
    }


@router.get("/settings")
async def get_settings_view(admin_email: str = Depends(get_admin_email), db: Session = Depends(get_db)):
    data = settings_service.get_all_settings(db)
    data["smtp_password_set"] = bool(data.pop("smtp_password"))
    return data


@router.put("/settings")
async def update_settings(
    payload: SettingsIn,
    request: Request,
    admin_email: str = Depends(get_admin_email),
    db: Session = Depends(get_db),
):
    updates = payload.model_dump(exclude_none=True)
    for key, value in updates.items():
        settings_service.set_setting(db, key, value)

    ip = request.client.host if request.client else None
    safe_keys = [k for k in updates if k != "smtp_password"]
    if "smtp_password" in updates:
        safe_keys.append("smtp_password(değiştirildi)")
    audit_service.log_action(db, admin_email, "SETTINGS_UPDATED", "SUCCESS", resource=",".join(safe_keys), ip_address=ip)

    data = settings_service.get_all_settings(db)
    data["smtp_password_set"] = bool(data.pop("smtp_password"))
    return data


@router.post("/settings/test-email")
async def send_test_email(
    payload: TestEmailIn,
    request: Request,
    admin_email: str = Depends(get_admin_email),
    db: Session = Depends(get_db),
):
    ip = request.client.host if request.client else None
    try:
        await email_service.send_test_email(payload.to_email)
    except Exception as exc:
        message = email_service.friendly_smtp_error(exc)
        audit_service.log_action(
            db, admin_email, "TEST_EMAIL_SENT", "FAILED", resource=payload.to_email, ip_address=ip, detail=str(exc)
        )
        raise HTTPException(status.HTTP_400_BAD_REQUEST, message)

    audit_service.log_action(db, admin_email, "TEST_EMAIL_SENT", "SUCCESS", resource=payload.to_email, ip_address=ip)
    return {"status": "sent"}


def _transfer_to_dict(t: Transfer) -> dict:
    return {
        "id": str(t.id),
        "sender_email": t.sender_email,
        "recipient_email": t.recipient_email,
        "filename": t.filename,
        "file_size": t.file_size,
        "subject": t.subject,
        "message": t.message,
        "download_token": t.download_token,
        "download_count": t.download_count,
        "max_downloads": t.max_downloads,
        "status": t.status,
        "created_at": t.created_at.isoformat(),
        "expires_at": t.expires_at.isoformat(),
    }
