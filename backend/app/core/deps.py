from fastapi import Depends, HTTPException, Header, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token


def get_sender_email(authorization: str | None = Header(default=None)) -> str:
    token = _extract_bearer(authorization)
    payload = decode_access_token(token) if token else None
    if not payload or payload.get("scope") != "sender_session":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Oturum geçersiz veya süresi dolmuş.")
    return payload["sub"]


def get_admin_email(authorization: str | None = Header(default=None)) -> str:
    token = _extract_bearer(authorization)
    payload = decode_access_token(token) if token else None
    if not payload or payload.get("scope") != "admin_session":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Admin oturumu geçersiz veya süresi dolmuş.")
    return payload["sub"]


def _extract_bearer(authorization: str | None) -> str | None:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    return authorization.split(" ", 1)[1].strip()
