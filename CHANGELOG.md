# Changelog

Bu dosya VaultSend'in sürüm geçmişini takip eder.

## [1.0.0] - 2026-09-16

İlk sürüm.

### Özellikler
- E-mail OTP ile personel girişi (LDAP/AD gerektirmez)
- Chunked/resumable büyük dosya yükleme (varsayılan limit admin panelden değiştirilebilir)
- Alıcıya otomatik e-mail ile süreli indirme linki gönderimi
- Gönderen tarafından özelleştirilebilir mail konu başlığı ve mesaj içeriği
- Admin panel: Dashboard, Transferler (filtre/arama/sayfalama), Audit Log, Ayarlar
- Ayarlardan yönetilebilir: maks dosya boyutu, link geçerliliği, maks indirme, saklama süresi, yasaklı dosya uzantıları, SMTP sunucu bilgileri (test mail gönderme dahil)
- Rastgele/tahmin edilemez indirme token'ları, hash'lenmiş OTP kodları
- Süresi dolan transferlerin otomatik expire edilip belirlenen süre sonra dosyalarının silinmesi
- Docker Compose ile tek komutla kurulum, kurulumda otomatik rastgele sır/parola üretimi (`scripts/install.sh` / `install.bat`)

### Bilinen sınırlamalar
- Tek sunucuya kurulur (multi-tenant/SaaS mimarisi değil)
- Depolama local filesystem üzerinde (S3/NAS entegrasyonu ileride eklenebilir)
- HTTPS/reverse proxy kurulumu bu sürüme dahil değil, ayrıca yapılandırılmalı
