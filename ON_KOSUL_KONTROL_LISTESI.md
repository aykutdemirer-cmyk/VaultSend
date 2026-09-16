# VaultSend — Ön Koşul Kontrol Listesi

Bu form, kurulum tarihinden önce müşterinin IT departmanı ile doldurulur. Amaç: kurulum günü sürpriz çıkmaması.

## 1. Firma / İletişim Bilgileri

| Alan | Değer |
|---|---|
| Firma adı | |
| Teknik iletişim kişisi | |
| Telefon | |
| E-mail | |
| Planlanan kurulum tarihi | |

## 2. Sunucu Bilgileri

| Alan | Değer |
|---|---|
| İşletim sistemi (Windows Server / Linux — sürüm) | |
| CPU / RAM | |
| Boş disk alanı (en az 20 GB önerilir) | |
| Docker kurulu mu? | ☐ Evet ☐ Hayır (kurulacak) |
| Sunucunun internet erişimi var mı? (ilk kurulumda Docker imajlarını indirmek için gerekli) | ☐ Evet ☐ Hayır |
| Sunucuya kim erişecek (RDP/SSH bilgisi kimde) | |

## 3. Ağ Bilgileri

| Alan | Değer |
|---|---|
| Sunucu IP adresi / hostname | |
| Kullanılacak port (varsayılan: 5173) | |
| Firewall'da bu port açık mı? | ☐ Evet ☐ Hayır |
| Sadece iç ağdan mı, dışarıdan da mı erişilecek? | ☐ Sadece iç ağ ☐ Dış ağ da |
| HTTPS / domain adı planı var mı? | ☐ Evet: __________ ☐ Hayır (HTTP kalacak) |

## 4. Mail (SMTP) Bilgileri

| Alan | Değer |
|---|---|
| SMTP sunucu adresi | |
| Port | |
| Kullanıcı adı | |
| Parola | *(kurulum günü güvenli şekilde iletilecek)* |
| TLS kullanılıyor mu? | ☐ Evet ☐ Hayır |
| Sunucu kendi imzalı (self-signed) sertifika mı kullanıyor? | ☐ Evet ☐ Hayır |
| Gönderen adresi (From) | |

## 5. Kullanım Beklentisi

| Alan | Değer |
|---|---|
| Tahmini kullanıcı (personel) sayısı | |
| Aylık tahmini dosya trafiği | |
| İhtiyaç duyulan maksimum dosya boyutu | |

## 6. Onay

| | |
|---|---|
| Dolduran kişi (Ad Soyad) | |
| Unvan | |
| Tarih | |
| İmza | |
