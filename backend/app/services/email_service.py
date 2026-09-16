import html
import logging
import ssl
import socket

import aiosmtplib
from email.message import EmailMessage

from app.core.database import SessionLocal
from app.services import settings_service

logger = logging.getLogger("securetransfer.email")


def _load_smtp_config() -> dict:
    db = SessionLocal()
    try:
        return settings_service.get_smtp_settings(db)
    finally:
        db.close()


async def _send(to_email: str, subject: str, html_body: str) -> None:
    cfg = _load_smtp_config()
    if not cfg["host"]:
        logger.warning("SMTP not configured — skipping email to %s (subject=%s)", to_email, subject)
        return

    message = EmailMessage()
    message["From"] = cfg["from_address"]
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content("Bu e-maili görüntülemek için HTML destekleyen bir istemci kullanın.")
    message.add_alternative(html_body, subtype="html")

    await aiosmtplib.send(
        message,
        hostname=cfg["host"],
        port=cfg["port"],
        username=cfg["username"] or None,
        password=cfg["password"] or None,
        start_tls=cfg["tls"],
        validate_certs=cfg["verify_cert"],
    )


async def send_otp_email(to_email: str, code: str, ttl_minutes: int) -> None:
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2 style="color:#111827">VaultSend</h2>
      <p>Doğrulama Kodunuz:</p>
      <div style="font-size:32px;font-weight:700;letter-spacing:4px;color:#4f46e5">{code}</div>
      <p style="color:#6b7280;margin-top:16px">Bu kod {ttl_minutes} dakika geçerlidir.</p>
      <p style="color:#9ca3af;font-size:12px">Bu işlemi siz başlatmadıysanız bu e-maili dikkate almayınız.</p>
    </div>
    """
    await _send(to_email, "VaultSend Doğrulama Kodunuz", html)


async def send_transfer_email(
    to_email: str,
    sender_email: str,
    filename: str,
    size_display: str,
    download_url: str,
    expires_at_display: str,
    subject: str | None = None,
    message: str | None = None,
) -> None:
    safe_filename = html.escape(filename)
    safe_sender = html.escape(sender_email)
    message_block = ""
    if message:
        message_block = f"""
      <div style="margin-top:16px;padding:16px;background:#f8fafc;border-radius:8px;white-space:pre-wrap;color:#334155">{html.escape(message)}</div>
        """

    body_html = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2 style="color:#111827">VaultSend</h2>
      <p>Size bir dosya gönderildi.</p>
      <p><strong>Gönderen:</strong> {safe_sender}</p>
      <p><strong>Dosya:</strong> {safe_filename}</p>
      <p><strong>Boyut:</strong> {size_display}</p>
      <p><strong>Geçerlilik:</strong> {expires_at_display}</p>
      {message_block}
      <a href="{download_url}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:linear-gradient(90deg,#4f46e5,#7c3aed);background-color:#4f46e5;color:#fff;text-decoration:none;border-radius:8px">DOSYAYI İNDİR</a>
    </div>
    """
    email_subject = subject.strip() if subject else f"{sender_email} size bir dosya gönderdi"
    await _send(to_email, email_subject, body_html)


def friendly_smtp_error(exc: Exception) -> str:
    if isinstance(exc, ssl.SSLCertVerificationError):
        return "SMTP sunucusunun sertifikası doğrulanamadı (self-signed/iç sertifika olabilir). 'Sertifika Doğrulaması' seçeneğini kapatıp tekrar deneyin."
    if isinstance(exc, aiosmtplib.SMTPAuthenticationError):
        return "SMTP kimlik doğrulaması başarısız. Kullanıcı adı/parolayı kontrol edin."
    if isinstance(exc, (socket.gaierror, ConnectionRefusedError)):
        return "SMTP sunucusuna bağlanılamadı. Sunucu adresi/port'u kontrol edin."
    if isinstance(exc, TimeoutError):
        return "SMTP sunucusuna bağlantı zaman aşımına uğradı."
    if isinstance(exc, RuntimeError):
        return "SMTP ayarları eksik. Önce sunucu bilgilerini girip kaydedin."
    return "Test e-maili gönderilemedi. SMTP ayarlarını kontrol edin."


async def send_test_email(to_email: str) -> None:
    cfg = _load_smtp_config()
    if not cfg["host"]:
        raise RuntimeError("SMTP is not configured")

    html = """
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2 style="color:#111827">VaultSend</h2>
      <p>Bu bir test e-mailidir. SMTP ayarlarınız doğru şekilde çalışıyor.</p>
    </div>
    """
    await _send(to_email, "VaultSend - Test E-maili", html)
