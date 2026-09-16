# VaultSend — Kurulum Kılavuzu

Sürüm: 1.0.0

Bu doküman, VaultSend'i kendi sunucunuza (on-premise) kurmanız için gereken adımları içerir. Yazılım tamamen sizin sunucunuzda çalışır — dosyalarınız ve veritabanınız hiçbir zaman üçüncü bir sunucuya gönderilmez.

## 1. Gereksinimler

- **İşletim sistemi:** Windows Server 2016+ veya herhangi bir modern Linux dağıtımı (Ubuntu 20.04+, Debian 11+ önerilir)
- **Docker:**
  - Windows: [Docker Desktop](https://www.docker.com/products/docker-desktop/)
  - Linux: Docker Engine + Docker Compose plugin
- **Disk alanı:** Beklenen dosya trafiğine göre en az 20 GB boş alan (yüklenen dosyalar bu diskte saklanır)
- **Ağ:** Sunucudan dışarıya SMTP sunucunuza (mail göndermek için) erişim; personel ve alıcıların sunucuya HTTP(S) ile erişebilmesi

## 2. Kurulum

### Windows

1. Verilen klasörü sunucuya kopyalayın (örn. `C:\VaultSend`).
2. Klasör içindeki **`install.bat`** dosyasına çift tıklayın.
3. Açılan pencerede işlem tamamlanana kadar bekleyin (ilk kurulumda birkaç dakika sürebilir).
4. İşlem sonunda ekranda çıkan **admin kullanıcı adı ve parolasını not edin** — bu bilgiler `ADMIN_CREDENTIALS.txt` dosyasına da yazılır.

### Linux

```bash
cd /opt/vaultsend        # klasörü kopyaladığınız yer
chmod +x scripts/install.sh
./scripts/install.sh
```

İşlem sonunda terminalde admin kullanıcı adı ve parolası gösterilir, aynı zamanda `ADMIN_CREDENTIALS.txt` dosyasına yazılır.

> **Önemli:** `ADMIN_CREDENTIALS.txt` dosyasını kurulumdan sonra güvenli bir yere taşıyıp (parola yöneticisi vb.) sunucudan silmeniz önerilir.

## 3. İlk Giriş

- **Personel arayüzü:** `http://<sunucu-adresi>:5173`
- **Admin panel:** `http://<sunucu-adresi>:5173/admin/login`

Admin panelde `ADMIN_CREDENTIALS.txt`'deki bilgilerle giriş yapın.

## 4. Mail (SMTP) Ayarlarını Girin

Personelin OTP kodu alması ve alıcılara indirme linki gitmesi için SMTP ayarlarının girilmesi **zorunludur**:

1. Admin Panel → **Ayarlar** → **Mail (SMTP) Ayarları**
2. Kendi mail sunucunuzun bilgilerini girin (sunucu adresi, port, kullanıcı adı, parola, gönderen adresi)
3. **"Test Mail Gönder"** ile bir test adresine mail göndererek ayarların doğru çalıştığını doğrulayın
4. Sunucunuz kendi imzalı (self-signed) bir sertifika kullanıyorsa "Sertifika doğrulaması yap" seçeneğini kapatmanız gerekebilir

## 5. Diğer Ayarlar (opsiyonel)

Admin Panel → Ayarlar altında şunları da değiştirebilirsiniz — kod değişikliği gerekmez:

| Ayar | Açıklama |
|---|---|
| Maksimum Dosya Boyutu | Yüklenebilecek en büyük dosya (GB) |
| Varsayılan Link Geçerliliği | Personel süre seçmezse kullanılacak varsayılan (saat) |
| Maksimum Link Geçerliliği | Personelin seçebileceği en uzun süre (saat) |
| Maksimum İndirme | Bir linkin kaç kez indirilebileceği (0 = sınırsız) |
| Süresi Dolan Dosya Saklama Süresi | Süresi dolan dosyanın diskten ne zaman silineceği (saat) |
| Yasaklı Dosya Uzantıları | Yüklenmesine izin verilmeyen dosya türleri |

## 6. Güncelleme

Yeni bir sürüm aldığınızda:

```bash
docker compose down
# yeni dosyaları eski klasörün üzerine kopyalayın (.env dosyanıza dokunmayın)
docker compose up -d --build
```

`.env` dosyanız ve içindeki sırlar/ayarlarınız korunur, veritabanınız (`db_data` volume) etkilenmez.

## 7. Yedekleme

Düzenli olarak şu iki Docker volume'unu yedeklemeniz önerilir:

```bash
docker run --rm -v securetransfer_db_data:/data -v %cd%:/backup alpine tar czf /backup/db_backup.tar.gz -C /data .
docker run --rm -v securetransfer_uploads_data:/data -v %cd%:/backup alpine tar czf /backup/uploads_backup.tar.gz -C /data .
```

(Linux'ta `%cd%` yerine `$(pwd)` kullanın.)

## 8. Üretim Ortamı İçin Ek Öneriler

- **HTTPS:** Sunucunun önüne bir reverse proxy (Nginx/Caddy/Traefik) koyup gerçek bir SSL sertifikası (Let's Encrypt vb.) kurmanızı öneririz. Varsayılan kurulum düz HTTP'dir.
- **Firewall:** Sadece personelin/alıcıların erişmesi gereken portu (varsayılan 5173) dışarı açın; `8000` portunu dış ağa kapatmanız önerilir.
- **Parola politikası:** Admin parolasını kurulumdan sonra ilk fırsatta kendi belirleyeceğiniz bir parolayla değiştirmeniz önerilir.

## Destek

Sorun/soru için: `[destek e-mail / telefon buraya eklenecek]`
