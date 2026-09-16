from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token
from app.schemas.schemas import OtpRequestIn, OtpVerifyIn, SessionOut
from app.services import otp_service
from app.services.otp_service import OtpError

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/otp/request", status_code=status.HTTP_204_NO_CONTENT)
async def request_otp(payload: OtpRequestIn, request: Request, db: Session = Depends(get_db)):
    try:
        otp_service.request_otp(db, payload.email.lower(), request.client.host if request.client else None)
    except OtpError as exc:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, exc.message)


@router.post("/otp/verify", response_model=SessionOut)
async def verify_otp(payload: OtpVerifyIn, request: Request, db: Session = Depends(get_db)):
    try:
        otp_service.verify_otp(db, payload.email.lower(), payload.code, request.client.host if request.client else None)
    except OtpError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, exc.message)

    token = create_access_token(payload.email.lower(), "sender_session", expires_minutes=60)
    return SessionOut(session_token=token, email=payload.email.lower())
