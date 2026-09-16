import re
import uuid
from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, BeforeValidator, Field

# email-validator's default rules reject internal/lab TLDs (.local, .lan, .internal, ...)
# as "special-use" domains, which breaks legitimate internal company addresses. This app
# is used purely internally, so we validate format only (local@domain.tld) without any
# public-deliverability or reserved-domain restriction.
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _validate_email(value: str) -> str:
    value = value.strip()
    if not _EMAIL_RE.match(value):
        raise ValueError("Geçerli bir e-mail adresi giriniz.")
    return value.lower()


Email = Annotated[str, BeforeValidator(_validate_email)]


class OtpRequestIn(BaseModel):
    email: Email


class OtpVerifyIn(BaseModel):
    email: Email
    code: str = Field(min_length=4, max_length=8)


class SessionOut(BaseModel):
    session_token: str
    email: Email


class UploadInitIn(BaseModel):
    filename: str
    file_size: int
    recipient_email: Email
    ttl_hours: int
    subject: str | None = Field(default=None, max_length=255)
    message: str | None = Field(default=None, max_length=5000)


class UploadInitOut(BaseModel):
    upload_id: str
    chunk_size: int


class UploadCompleteIn(BaseModel):
    upload_id: str
    total_chunks: int


class TransferOut(BaseModel):
    id: uuid.UUID
    sender_email: str
    recipient_email: str
    filename: str
    file_size: int
    subject: str | None = None
    message: str | None = None
    download_token: str
    download_count: int
    max_downloads: int
    expires_at: datetime
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class TransferDetailOut(TransferOut):
    activity: list[dict]


class AdminLoginIn(BaseModel):
    # Admin identifier is an internal login username, not a real mailbox — unlike
    # personnel OTP addresses it never needs to receive mail, so no email-format check.
    email: str = Field(min_length=1, max_length=255)
    password: str


class AdminSessionOut(BaseModel):
    token: str


class SettingsIn(BaseModel):
    max_file_size_gb: float | None = None
    default_link_ttl_hours: int | None = None
    max_link_ttl_hours: int | None = None
    max_downloads: int | None = None
    expired_retention_hours: int | None = None
    blocked_extensions: str | None = None
    smtp_host: str | None = None
    smtp_port: int | None = None
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_from: str | None = None
    smtp_tls: bool | None = None
    smtp_verify_cert: bool | None = None


class TestEmailIn(BaseModel):
    to_email: Email


class PublicDownloadOut(BaseModel):
    filename: str
    file_size: int
    sender_email: str
    message: str | None = None
    expires_at: datetime
    status: str
    download_count: int
    max_downloads: int
