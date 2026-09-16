# VaultSend

Kurum içi WeTransfer alternatifi. E-mail OTP doğrulaması ile personel büyük dosyaları güvenli, süreli linklerle dışarıya gönderir.

## Hızlı Başlangıç

```bash
cp .env.example .env
# .env içindeki APP_SECRET_KEY, POSTGRES_PASSWORD, ADMIN_BOOTSTRAP_PASSWORD ve SMTP_* değerlerini doldurun
docker compose up -d --build
```

- Uygulama: http://localhost:5173
- Admin panel: http://localhost:5173/admin/login (`.env`'deki `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` ile giriş yapılır, sadece ilk çalıştırmada oluşturulur)
- API doğrudan: http://localhost:8000

SMTP bilgileri boş bırakılırsa e-mailler gönderilmez, sadece log'a düşer (geliştirme için).

## Mimari

- **backend/** — FastAPI + SQLAlchemy + Alembic + PostgreSQL. Tek servis, chunked/resumable upload, OTP auth, admin auth, APScheduler ile 15 dakikada bir expire/cleanup taraması.
- **frontend/** — React + TypeScript + Vite + Tailwind. Nginx ile prod build servis edilir, `/api` backend'e proxy'lenir.
- **storage** — `app/services/storage_service.py` local filesystem üzerinde çalışır; S3/NAS'e geçiş bu dosya değiştirilerek yapılır, başka yer dokunulmaz.
- **ayarlar** — Maks dosya boyutu, link süresi, retention, yasaklı uzantılar `system_settings` tablosunda; yoksa `.env` default'u kullanılır. Admin panel > Ayarlar'dan değiştirilir, kod değişikliği gerekmez.

## Geliştirme (Docker olmadan)

```bash
# backend
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# frontend
cd frontend
npm install
npm run dev
```

## Notlar

- Download token'lar `secrets.token_urlsafe(32)` ile üretilir, sıralı ID kullanılmaz.
- OTP kodları DB'de sadece SHA-256 hash olarak tutulur.
- Yasaklı dosya uzantıları ve diğer tüm limitler admin panelinden çalışma zamanında değiştirilebilir.
