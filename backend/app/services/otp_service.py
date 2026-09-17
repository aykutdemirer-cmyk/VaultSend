from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import generate_otp, hash_otp
from app.models import OtpCode, User
from app.services import audit_service

settings = get_settings()

# A single email is throttled by otp_resend_cooldown_seconds, but that alone doesn't
# stop someone hammering this unauthenticated endpoint with a different address each
# time — which would turn the company's own SMTP relay into a spam cannon. Cap total
# requests per source IP too.
IP_RATE_LIMIT_WINDOW_MINUTES = 10
IP_RATE_LIMIT_MAX_REQUESTS = 10


class OtpError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


def request_otp(db: Session, email: str, ip_address: str | None) -> None:
    now = datetime.now(timezone.utc)
    cooldown_cutoff = now - timedelta(seconds=settings.otp_resend_cooldown_seconds)

    if ip_address:
        ip_window_cutoff = now - timedelta(minutes=IP_RATE_LIMIT_WINDOW_MINUTES)
        ip_count = (
            db.query(OtpCode)
            .filter(OtpCode.ip_address == ip_address, OtpCode.created_at > ip_window_cutoff)
            .count()
        )
        if ip_count >= IP_RATE_LIMIT_MAX_REQUESTS:
            audit_service.log_action(db, email, "OTP_REQUEST", "IP_RATE_LIMITED", ip_address=ip_address)
            raise OtpError("ip_rate_limited", "Bu adresten çok fazla istek yapıldı. Lütfen bir süre sonra tekrar deneyin.")

    recent = (
        db.query(OtpCode)
        .filter(OtpCode.email == email, OtpCode.created_at > cooldown_cutoff)
        .order_by(OtpCode.created_at.desc())
        .first()
    )
    if recent is not None:
        audit_service.log_action(db, email, "OTP_REQUEST", "RATE_LIMITED", ip_address=ip_address)
        raise OtpError("rate_limited", "Çok sık kod istediniz. Lütfen bir süre sonra tekrar deneyin.")

    if not db.query(User).filter(User.email == email).first():
        db.add(User(email=email))
        db.commit()

    code = generate_otp(settings.otp_length)
    otp = OtpCode(
        email=email,
        code_hash=hash_otp(code),
        expires_at=now + timedelta(minutes=settings.otp_ttl_minutes),
        ip_address=ip_address,
    )
    db.add(otp)
    db.commit()

    audit_service.log_action(db, email, "OTP_REQUEST", "SUCCESS", ip_address=ip_address)

    from app.services.email_service import send_otp_email
    import asyncio

    asyncio.create_task(send_otp_email(email, code, settings.otp_ttl_minutes))


def verify_otp(db: Session, email: str, code: str, ip_address: str | None) -> bool:
    now = datetime.now(timezone.utc)
    otp = (
        db.query(OtpCode)
        .filter(OtpCode.email == email, OtpCode.used.is_(False))
        .order_by(OtpCode.created_at.desc())
        .first()
    )

    if otp is None or otp.expires_at < now:
        audit_service.log_action(db, email, "OTP_VERIFIED", "FAILED_EXPIRED", ip_address=ip_address)
        raise OtpError("expired_or_missing", "Doğrulama kodu bulunamadı veya süresi doldu.")

    if otp.attempts >= settings.otp_max_attempts:
        audit_service.log_action(db, email, "OTP_VERIFIED", "FAILED_LOCKED", ip_address=ip_address)
        raise OtpError("too_many_attempts", "Çok fazla hatalı deneme yapıldı. Yeni kod isteyin.")

    if hash_otp(code) != otp.code_hash:
        otp.attempts += 1
        db.commit()
        audit_service.log_action(db, email, "OTP_VERIFIED", "FAILED_INVALID", ip_address=ip_address)
        raise OtpError("invalid_code", "Doğrulama kodu hatalı.")

    otp.used = True
    db.commit()
    audit_service.log_action(db, email, "OTP_VERIFIED", "SUCCESS", ip_address=ip_address)
    return True
