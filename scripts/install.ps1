# VaultSend on-prem kurulum scripti (Windows)
# Her kurulumda kendi rastgele sırlarını üretir - iki müşteri asla aynı
# APP_SECRET_KEY / DB parolası / admin parolasını paylaşmaz.

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

function New-RandomHex($byteLength) {
    $bytes = New-Object byte[] $byteLength
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    -join ($bytes | ForEach-Object { $_.ToString("x2") })
}

if (Test-Path ".env") {
    Write-Host ".env dosyasi zaten mevcut, uzerine yazilmadi."
    Write-Host "Sirlari yeniden uretmek isterseniz .env dosyasini silip scripti tekrar calistirin."
} else {
    Copy-Item ".env.example" ".env"

    $secretKey = New-RandomHex 32
    $dbPassword = New-RandomHex 16
    $adminPassword = New-RandomHex 8

    (Get-Content ".env") | ForEach-Object {
        $line = $_
        $line = $line -replace '^APP_SECRET_KEY=.*', "APP_SECRET_KEY=$secretKey"
        $line = $line -replace '^POSTGRES_PASSWORD=.*', "POSTGRES_PASSWORD=$dbPassword"
        $line = $line -replace '^DATABASE_URL=.*', "DATABASE_URL=postgresql+psycopg://securetransfer:$dbPassword@db:5432/securetransfer"
        $line = $line -replace '^ADMIN_BOOTSTRAP_EMAIL=.*', "ADMIN_BOOTSTRAP_EMAIL=admin"
        $line = $line -replace '^ADMIN_BOOTSTRAP_PASSWORD=.*', "ADMIN_BOOTSTRAP_PASSWORD=$adminPassword"
        $line
    } | Set-Content ".env"

    @"
VaultSend Admin Giris Bilgileri
================================
Kullanici adi : admin
Parola        : $adminPassword

Bu dosyayi guvenli bir yere tasiyip sunucudan silmeniz onerilir.
"@ | Set-Content "ADMIN_CREDENTIALS.txt"

    Write-Host "===================================================="
    Write-Host " Admin giris bilgileri (ADMIN_CREDENTIALS.txt dosyasina da yazildi):"
    Write-Host "   Kullanici adi : admin"
    Write-Host "   Parola        : $adminPassword"
    Write-Host "===================================================="
}

Write-Host ""
Write-Host "Docker imajlari derleniyor ve servisler baslatiliyor (bu birkac dakika surebilir)..."
docker compose up -d --build

Write-Host ""
Write-Host "Kurulum tamamlandi."
Write-Host "  Personel arayuzu : http://localhost:5173"
Write-Host "  Admin panel      : http://localhost:5173/admin/login"
Write-Host ""
Write-Host "Not: Mail gonderiminin calismasi icin Admin Panel > Ayarlar bolumunden SMTP bilgilerinizi girmeniz gerekir."
