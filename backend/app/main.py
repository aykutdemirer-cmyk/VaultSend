import logging
from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, upload, download, admin
from app.core.config import get_settings
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models import AdminUser

logging.basicConfig(level=logging.INFO)
settings = get_settings()

scheduler = BackgroundScheduler()


def _bootstrap_admin() -> None:
    if not settings.admin_bootstrap_email:
        return
    db = SessionLocal()
    try:
        if db.query(AdminUser).count() == 0:
            db.add(
                AdminUser(
                    email=settings.admin_bootstrap_email.lower(),
                    password_hash=hash_password(settings.admin_bootstrap_password),
                )
            )
            db.commit()
            logging.info("Bootstrapped initial admin user: %s", settings.admin_bootstrap_email)
    finally:
        db.close()


def _cleanup_job() -> None:
    from app.services import cleanup_service

    db = SessionLocal()
    try:
        cleanup_service.run_cleanup_cycle(db)
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    _bootstrap_admin()
    scheduler.add_job(_cleanup_job, "interval", minutes=15, id="cleanup_cycle")
    scheduler.start()
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(title=settings.brand_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_base_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(download.router)
app.include_router(admin.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/api/config")
async def public_config():
    return {"brand_name": settings.brand_name}
