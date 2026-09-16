# VaultSend — Kurulum Sonrası Kabul Testi (UAT)

Kurulum tamamlandıktan sonra satıcı ve müşteri temsilcisi birlikte bu listeyi geçer. Tüm maddeler işaretlenmeden kurulum "tamamlandı" sayılmaz.

## Kurulum Bilgileri

| Alan | Değer |
|---|---|
| Firma adı | |
| Kurulum tarihi | |
| Sürüm | 1.0.0 |
| Sunucu adresi | |

## 1. Teknik Sağlık Kontrolleri

- ☐ `docker compose ps` çıktısında 3 servis de (`db`, `backend`, `frontend`) "Up" durumda
- ☐ Backend health check yanıt veriyor (`/api/health` → 200)
- ☐ Frontend ana sayfa tarayıcıda açılıyor
- ☐ Admin panel girişi başarılı (`/admin/login`)
- ☐ SMTP "Test Mail Gönder" başarılı

## 2. Fonksiyonel Testler (Personel Akışı)

- ☐ Personel e-mail adresini girip doğrulama kodu aldı
- ☐ Kod başarıyla doğrulandı, yükleme ekranına geçildi
- ☐ Bir dosya başarıyla yüklendi
- ☐ Büyük bir dosya (1 GB+) sorunsuz yüklendi *(varsa ilgili senaryo)*
- ☐ Alıcıya indirme linkini içeren mail ulaştı
- ☐ Alıcı linke tıklayıp dosyayı başarıyla indirdi
- ☐ Konu başlığı / mesaj alanı doldurulduğunda mail içeriğine doğru yansıdı

## 3. Admin Panel Kontrolleri

- ☐ Dashboard'da doğru transfer/veri sayıları görünüyor
- ☐ Transferler listesinde yeni transfer doğru bilgilerle (gönderen, alıcı, boyut, durum) görünüyor
- ☐ Transfer detay ekranında aktivite geçmişi doğru sırayla görünüyor
- ☐ Audit Log'da ilgili aksiyonlar (OTP_REQUEST, OTP_VERIFIED, FILE_UPLOADED, EMAIL_SENT, FILE_DOWNLOADED) kayıtlı
- ☐ Ayarlar sayfasından bir değer değiştirilip kaydedildi, değişiklik yansıdı

## 4. Güvenlik Kontrolleri

- ☐ Varsayılan admin parolası değiştirildi (kurulum scriptinin ürettiği rastgele parola kalıcı olarak not edildi)
- ☐ `ADMIN_CREDENTIALS.txt` dosyası sunucudan silindi / güvenli bir yere taşındı
- ☐ `.env` dosyasındaki sırların (APP_SECRET_KEY, DB parolası) varsayılan/örnek değerde kalmadığı doğrulandı
- ☐ Sadece gerekli portlar (varsayılan 5173) dışa açık, 8000/5432 dışarıya kapalı

## 5. Devir Teslim

- ☐ Kurulum kılavuzu (VaultSend_Kurulum_Kilavuzu.docx) müşteriye teslim edildi
- ☐ Admin panelin temel kullanımı için kısa bir eğitim verildi
- ☐ Destek iletişim bilgisi paylaşıldı
- ☐ Güncelleme ve yedekleme prosedürü açıklandı

## Onay

| | Müşteri Temsilcisi | Satıcı Temsilcisi |
|---|---|---|
| Ad Soyad | | |
| Unvan | | |
| Tarih | | |
| İmza | | |
