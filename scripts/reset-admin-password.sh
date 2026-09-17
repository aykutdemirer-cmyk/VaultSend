#!/usr/bin/env bash
# Admin parolasını unuttuğunuzda çalıştırın — rastgele yeni bir parola üretir,
# admin kullanıcısına uygular ve ADMIN_CREDENTIALS.txt dosyasını günceller.
set -e

cd "$(dirname "$0")/.."

NEW_PASSWORD=$(openssl rand -hex 8)

docker compose exec -T backend python -c "
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models import AdminUser

db = SessionLocal()
admin = db.query(AdminUser).first()
if admin:
    admin.email = 'admin'
    admin.password_hash = hash_password('${NEW_PASSWORD}')
    db.commit()
    print('Mevcut admin kullanicisi guncellendi.')
else:
    db.add(AdminUser(email='admin', password_hash=hash_password('${NEW_PASSWORD}')))
    db.commit()
    print('Admin kullanicisi olusturuldu.')
"

cat > ADMIN_CREDENTIALS.txt <<EOF
VaultSend Admin Giriş Bilgileri (YENİLENDİ)
============================================
Kullanıcı adı  : admin
Parola         : ${NEW_PASSWORD}
Yenileme tarihi: $(date '+%Y-%m-%d %H:%M:%S')

Bu dosyayı güvenli bir yere taşıyıp sunucudan silmeniz önerilir.
EOF

echo "===================================================="
echo " Yeni admin parolası: ${NEW_PASSWORD}"
echo " (ADMIN_CREDENTIALS.txt dosyası da güncellendi)"
echo "===================================================="
