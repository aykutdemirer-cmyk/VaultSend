from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import SystemSetting

settings = get_settings()


def _to_bool(value) -> bool:
    return str(value).strip().lower() in ("true", "1", "yes")


_DEFAULTS = {
    "max_file_size_gb": str(settings.max_file_size_gb),
    "default_link_ttl_hours": str(settings.default_link_ttl_hours),
    "max_link_ttl_hours": str(settings.max_link_ttl_hours),
    "max_downloads": str(settings.max_downloads),
    "expired_retention_hours": str(settings.expired_retention_hours),
    "blocked_extensions": settings.blocked_extensions,
    "smtp_host": settings.smtp_host,
    "smtp_port": str(settings.smtp_port),
    "smtp_username": settings.smtp_username,
    "smtp_password": settings.smtp_password,
    "smtp_from": settings.smtp_from,
    "smtp_tls": str(settings.smtp_tls).lower(),
    "smtp_verify_cert": "true",
}

_CASTERS = {
    "max_file_size_gb": float,
    "default_link_ttl_hours": int,
    "max_link_ttl_hours": int,
    "max_downloads": int,
    "expired_retention_hours": int,
    "blocked_extensions": str,
    "smtp_host": str,
    "smtp_port": int,
    "smtp_username": str,
    "smtp_password": str,
    "smtp_from": str,
    "smtp_tls": _to_bool,
    "smtp_verify_cert": _to_bool,
}

SMTP_KEYS = ["smtp_host", "smtp_port", "smtp_username", "smtp_password", "smtp_from", "smtp_tls"]


def get_setting(db: Session, key: str):
    row = db.get(SystemSetting, key)
    raw = row.value if row else _DEFAULTS.get(key)
    caster = _CASTERS.get(key, str)
    return caster(raw)


def get_all_settings(db: Session) -> dict:
    return {key: get_setting(db, key) for key in _DEFAULTS}


def set_setting(db: Session, key: str, value) -> None:
    if key not in _DEFAULTS:
        raise ValueError(f"Unknown setting: {key}")
    row = db.get(SystemSetting, key)
    if row is None:
        row = SystemSetting(key=key, value=str(value))
        db.add(row)
    else:
        row.value = str(value)
    db.commit()


def get_blocked_extensions(db: Session) -> list[str]:
    raw = get_setting(db, "blocked_extensions")
    return [ext.strip().lower() for ext in raw.split(",") if ext.strip()]


def get_smtp_settings(db: Session) -> dict:
    return {
        "host": get_setting(db, "smtp_host"),
        "port": get_setting(db, "smtp_port"),
        "username": get_setting(db, "smtp_username"),
        "password": get_setting(db, "smtp_password"),
        "from_address": get_setting(db, "smtp_from"),
        "tls": get_setting(db, "smtp_tls"),
        "verify_cert": get_setting(db, "smtp_verify_cert"),
    }
