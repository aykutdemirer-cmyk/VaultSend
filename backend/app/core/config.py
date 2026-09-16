from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    app_secret_key: str
    app_base_url: str = "http://localhost:8000"
    frontend_base_url: str = "http://localhost:5173"
    environment: str = "development"

    max_file_size_gb: float = 10
    default_link_ttl_hours: int = 24
    max_link_ttl_hours: int = 168
    max_downloads: int = 0
    expired_retention_hours: int = 24
    blocked_extensions: str = ".exe,.bat,.cmd,.ps1,.vbs,.scr,.dll"

    otp_length: int = 6
    otp_ttl_minutes: int = 10
    otp_max_attempts: int = 5
    otp_resend_cooldown_seconds: int = 60

    storage_path: str = "/data/uploads"

    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from: str = "VaultSend <no-reply@firma.com>"
    smtp_tls: bool = True

    admin_bootstrap_email: str = ""
    admin_bootstrap_password: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
