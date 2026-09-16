# VaultSend — Yazılım Lisans ve Destek Sözleşmesi (TASLAK)

> **UYARI:** Bu belge bir taslaktır, hukuki tavsiye değildir. Resmi olarak kullanmadan önce bir avukata inceletmeniz gerekir. Köşeli parantez `[...]` içindeki alanlar doldurulmalıdır.

---

**Bu Sözleşme**, aşağıda bilgileri yer alan taraflar arasında **[TARİH]** tarihinde akdedilmiştir:

**LİSANS VEREN:** [Şirket Unvanınız], [Adres] ("**Lisans Veren**")

**LİSANS ALAN:** [Müşteri Şirket Unvanı], [Adres] ("**Lisans Alan**")

Taraflar, aşağıdaki şartlarda anlaşmışlardır:

## 1. Tanımlar

- **"Yazılım"**: VaultSend adlı, dosya transfer sistemi olarak sunulan yazılım (kaynak kodu değil, çalışan uygulama olarak).
- **"Sunucu"**: Yazılımın kurulacağı, Lisans Alan'a ait veya Lisans Alan'ın kontrolündeki fiziksel/sanal sunucu.
- **"Kullanıcı"**: Yazılımı personel arayüzünden kullanan Lisans Alan çalışanları.
- **"Güncelleme"**: Yazılımın hata düzeltme, güvenlik yaması veya küçük özellik eklemelerini içeren sürümleri.

## 2. Lisans Kapsamı

2.1. Lisans Veren, Lisans Alan'a, Yazılımı **[BİR (1)] adet sunucuya kurmak ve en fazla [KULLANICI SAYISI] kullanıcı için kullanmak üzere**, münhasır olmayan (non-exclusive), devredilemez (non-transferable) bir kullanım lisansı verir.

2.2. Bu lisans; Yazılımın kaynak kodunun tesliminin **yapılmadığı**, Lisans Alan'ın Yazılımı çoğaltma, tersine mühendislik yapma, alt lisanslama veya üçüncü taraflara devretme hakkı **olmadığı** şekilde sınırlıdır.

2.3. Lisans, işbu Sözleşme'nin imza tarihinden itibaren **[SÜREKLİ / 1 YIL / ...]** geçerlidir.

## 3. Teslimat ve Kurulum

3.1. Lisans Veren, Yazılımı kurulum paketi (Docker imajları + kurulum scriptleri) ve kurulum kılavuzu ile birlikte teslim eder.

3.2. Kurulum, Lisans Veren tarafından uzaktan destekli olarak veya Lisans Alan'ın kendi IT ekibi tarafından kurulum kılavuzuna uygun şekilde gerçekleştirilir.

3.3. Kurulumun tamamlandığı, taraflarca birlikte imzalanan **Kabul Testi (UAT) Formu** ile teyit edilir.

## 4. Ücretler ve Ödeme

| Kalem | Tutar | Ödeme Zamanı |
|---|---|---|
| Lisans Bedeli (tek seferlik) | [TUTAR] | Sözleşme imzası / kurulum öncesi |
| Yıllık Destek ve Bakım Bedeli | Lisans bedelinin **[%15-20]**'si | Her yıl, lisans yıl dönümünde |
| Kurulum/Devreye Alma (varsa ek ücret) | [TUTAR] | Kurulum tamamlandığında |

4.1. Ödemeler [KDV DAHİL/HARİÇ] olarak, fatura tarihinden itibaren **[14/30]** gün içinde yapılır.

4.2. Yıllık destek bedeli ödenmediği takdirde Lisans Veren, güncelleme ve destek hizmetini durdurma hakkına sahiptir; Yazılımın kurulu kopyası çalışmaya devam eder ancak destek kapsamı dışında kalır.

## 5. Destek ve Bakım

5.1. Destek kapsamı: hata bildirimi, kullanım soruları, güncelleme sağlanması.

5.2. Destek talebi yanıt süreleri (iş günü içinde):

| Öncelik | İlk Yanıt | Çözüm Hedefi |
|---|---|---|
| Kritik (sistem tamamen çalışmıyor) | [4 saat] | [1 iş günü] |
| Yüksek (önemli fonksiyon bozuk) | [1 iş günü] | [3 iş günü] |
| Normal (küçük hata/soru) | [2 iş günü] | [5 iş günü] |

5.3. Destek, [E-MAIL / TELEFON / DESTEK PORTALI] üzerinden [MESAI SAATLERİ] içinde sağlanır.

5.4. Güncellemeler Lisans Veren tarafından bildirilir; kurulumu Lisans Alan'ın IT ekibi (kurulum kılavuzuna uygun olarak) veya talep halinde Lisans Veren gerçekleştirir.

## 6. Fikri Mülkiyet

6.1. Yazılım üzerindeki tüm fikri mülkiyet hakları Lisans Veren'e aittir. Bu Sözleşme, Lisans Alan'a yalnızca kullanım hakkı verir, mülkiyet devri anlamına gelmez.

6.2. Lisans Alan'ın Yazılım üzerinde yapacağı herhangi bir değişiklik, türetme veya entegrasyon önceden yazılı onay gerektirir.

## 7. Veri Sahipliği ve Gizlilik

7.1. Yazılım, Lisans Alan'ın kendi sunucusunda (on-premise) çalışır; Lisans Alan'ın yüklediği dosyalar, personel/alıcı e-mail adresleri ve tüm sistem verileri **yalnızca Lisans Alan'ın sunucusunda** tutulur, Lisans Veren'e iletilmez veya Lisans Veren'in sunucularında saklanmaz.

7.2. Destek sürecinde Lisans Veren'in sunucuya erişimi gerekirse, bu erişim önceden Lisans Alan'ın onayı ile ve sınırlı süreli olarak yapılır.

7.3. Taraflar, Sözleşme kapsamında öğrendikleri birbirlerine ait ticari/teknik bilgileri gizli tutmayı taahhüt eder.

## 8. Garanti ve Sorumluluk Sınırlaması

8.1. Lisans Veren, Yazılımın kurulum kılavuzunda belirtilen şekilde çalışacağını taahhüt eder ancak Yazılımın kesintisiz veya hatasız çalışacağına dair açık/zımni garanti vermez.

8.2. Lisans Veren'in bu Sözleşme'den doğan toplam sorumluluğu, Lisans Alan'ın ödediği **son 12 aylık lisans/destek bedeli** ile sınırlıdır.

8.3. Lisans Veren, dolaylı zararlardan (kâr kaybı, veri kaybı vb.) sorumlu tutulamaz — **[bu madde yargı bölgesine göre uygulanabilirliği değişebilir, avukat kontrolü gerekir]**.

## 9. Süre ve Fesih

9.1. Bu Sözleşme, imza tarihinde başlar ve Madde 2.3'te belirtilen süre boyunca geçerlidir.

9.2. Taraflardan biri, diğerinin Sözleşme'yi esaslı şekilde ihlal etmesi ve bu ihlalin yazılı bildirimden itibaren **[30]** gün içinde giderilmemesi halinde Sözleşme'yi feshedebilir.

9.3. Fesih halinde, Lisans Alan'ın Yazılımı kullanma hakkı sona erer; Lisans Alan kendi verilerini (dosyalar, veritabanı) sunucusundan kendisi alır — bu veriler zaten hiçbir zaman Lisans Veren'de tutulmamaktadır.

## 10. Uygulanacak Hukuk ve Yetkili Mahkeme

Bu Sözleşme **Türkiye Cumhuriyeti** kanunlarına tabidir. Sözleşme'den doğan ihtilaflarda **[ŞEHİR]** Mahkemeleri ve İcra Daireleri yetkilidir.

## 11. Diğer Hükümler

11.1. Bu Sözleşme, taraflar arasındaki anlaşmanın tamamını oluşturur; önceki sözlü/yazılı anlaşmaların yerini alır.

11.2. Değişiklikler yalnızca yazılı ve her iki tarafça imzalanmış ek protokol ile yapılabilir.

11.3. Mücbir sebep hallerinde taraflar edimlerini yerine getirememekten sorumlu tutulamaz.

---

## İmzalar

| | LİSANS VEREN | LİSANS ALAN |
|---|---|---|
| Unvan | | |
| Ad Soyad | | |
| Tarih | | |
| İmza | | |
