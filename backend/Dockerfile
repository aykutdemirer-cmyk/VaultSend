FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends libpq-dev gcc curl && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /data/uploads \
    && useradd --create-home --uid 1000 appuser \
    && chown -R appuser:appuser /app /data

EXPOSE 8000

# Stays root at container start so it can fix ownership on the mounted /data
# volume (which may pre-date this non-root image, e.g. after an upgrade) —
# then drops to appuser for the actual app process.
CMD ["sh", "-c", "chown -R appuser:appuser /data && su -s /bin/sh appuser -c 'alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port 8000'"]
