# Admin parolasini unuttugunuzda calistirin - rastgele yeni bir parola uretir,
# admin kullanicisina uygular ve ADMIN_CREDENTIALS.txt dosyasini gunceller.

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

function New-RandomHex($byteLength) {
    $bytes = New-Object byte[] $byteLength
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    -join ($bytes | ForEach-Object { $_.ToString("x2") })
}

$newPassword = New-RandomHex 8

$pyScript = @"
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models import AdminUser

db = SessionLocal()
admin = db.query(AdminUser).first()
if admin:
    admin.email = 'admin'
    admin.password_hash = hash_password('$newPassword')
    db.commit()
    print('Mevcut admin kullanicisi guncellendi.')
else:
    db.add(AdminUser(email='admin', password_hash=hash_password('$newPassword')))
    db.commit()
    print('Admin kullanicisi olusturuldu.')
"@

docker compose exec -T backend python -c $pyScript

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

@"
VaultSend Admin Giris Bilgileri (YENILENDI)
============================================
Kullanici adi   : admin
Parola          : $newPassword
Yenileme tarihi : $timestamp

Bu dosyayi guvenli bir yere tasiyip sunucudan silmeniz onerilir.
"@ | Set-Content "ADMIN_CREDENTIALS.txt"

Write-Host "===================================================="
Write-Host " Yeni admin parolasi: $newPassword"
Write-Host " (ADMIN_CREDENTIALS.txt dosyasi da guncellendi)"
Write-Host "===================================================="
