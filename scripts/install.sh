#!/usr/bin/env bash
# VaultSend on-prem kurulum scripti (Linux / macOS)
# Her kurulumda kendi rastgele sırlarını üretir — iki müşteri asla aynı
# APP_SECRET_KEY / DB parolası / admin parolasını paylaşmaz.
set -e

cd "$(dirname "$0")/.."

if [ -f .env ]; then
  echo ".env dosyası zaten mevcut, üzerine yazılmadı."
  echo "Sırları yeniden üretmek isterseniz .env dosyasını silip scripti tekrar çalıştırın."
else
  cp .env.example .env

  SECRET_KEY=$(openssl rand -hex 32)
  DB_PASSWORD=$(openssl rand -hex 16)
  ADMIN_PASSWORD=$(openssl rand -hex 8)

  sed -i.bak \
    -e "s/^APP_SECRET_KEY=.*/APP_SECRET_KEY=${SECRET_KEY}/" \
    -e "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${DB_PASSWORD}/" \
    -e "s#^DATABASE_URL=.*#DATABASE_URL=postgresql+psycopg://securetransfer:${DB_PASSWORD}@db:5432/securetransfer#" \
    -e "s/^ADMIN_BOOTSTRAP_EMAIL=.*/ADMIN_BOOTSTRAP_EMAIL=admin/" \
    -e "s/^ADMIN_BOOTSTRAP_PASSWORD=.*/ADMIN_BOOTSTRAP_PASSWORD=${ADMIN_PASSWORD}/" \
    .env
  rm -f .env.bak

  cat > ADMIN_CREDENTIALS.txt <<EOF
VaultSend Admin Giriş Bilgileri
================================
Kullanıcı adı : admin
Parola        : ${ADMIN_PASSWORD}

Bu dosyayı güvenli bir yere taşıyıp sunucudan silmeniz önerilir.
EOF

  echo "===================================================="
  echo " Admin giriş bilgileri (ADMIN_CREDENTIALS.txt dosyasına da yazıldı):"
  echo "   Kullanıcı adı : admin"
  echo "   Parola        : ${ADMIN_PASSWORD}"
  echo "===================================================="
fi

echo ""
echo "Docker imajları derleniyor ve servisler başlatılıyor (bu birkaç dakika sürebilir)..."
docker compose up -d --build

echo ""
echo "Kurulum tamamlandı."
echo "  Personel arayüzü : http://localhost:5173"
echo "  Admin panel      : http://localhost:5173/admin/login"
echo ""
echo "Not: Mail gönderiminin çalışması için Admin Panel > Ayarlar bölümünden SMTP bilgilerinizi girmeniz gerekir."
