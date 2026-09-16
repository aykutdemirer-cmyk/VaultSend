const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, AlignmentType, PageBreak, Header, Footer,
} = require("docx");

const INDIGO = "4F46E5";
const DARK = "1E1B2E";
const SLATE = "475569";
const WARN_BG = "FEF3C7";
const WARN_TEXT = "92400E";
const ROW_ALT = "F8FAFC";
const BORDER = "E2E8F0";

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 160 },
    border: { bottom: { color: INDIGO, space: 4, style: BorderStyle.SINGLE, size: 6 } },
    children: [new TextRun({ text, bold: true, color: DARK, size: 26 })],
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 140 },
    children: [new TextRun({ text, color: DARK, size: 21, ...opts })],
  });
}

function bracketNote(text) {
  return new Paragraph({
    spacing: { after: 140 },
    children: [new TextRun({ text, color: "B91C1C", size: 20, italics: true })],
  });
}

function warnBox(text) {
  return new Paragraph({
    spacing: { before: 200, after: 300 },
    shading: { type: ShadingType.CLEAR, fill: WARN_BG },
    border: {
      top: { style: BorderStyle.SINGLE, size: 6, color: "F59E0B" },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "F59E0B" },
      left: { style: BorderStyle.SINGLE, size: 6, color: "F59E0B" },
      right: { style: BorderStyle.SINGLE, size: 6, color: "F59E0B" },
    },
    children: [new TextRun({ text, bold: true, color: WARN_TEXT, size: 21 })],
  });
}

function twoColTable(rows) {
  const colWidths = [3600, 5900];
  const trs = rows.map(([label, val], idx) => {
    const fill = idx % 2 === 0 ? "FFFFFF" : ROW_ALT;
    return new TableRow({
      children: [
        new TableCell({
          width: { size: colWidths[0], type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill },
          margins: { top: 90, bottom: 90, left: 130, right: 130 },
          children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20, color: DARK })] })],
        }),
        new TableCell({
          width: { size: colWidths[1], type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill },
          margins: { top: 90, bottom: 90, left: 130, right: 130 },
          children: [new Paragraph({ children: [new TextRun({ text: val, size: 20, color: SLATE })] })],
        }),
      ],
    });
  });
  return new Table({
    width: { size: colWidths[0] + colWidths[1], type: WidthType.DXA },
    columnWidths: colWidths,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
      left: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
      right: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
    },
    rows: trs,
  });
}

function feeTable() {
  const colWidths = [3600, 2800, 3100];
  const header = new TableRow({
    tableHeader: true,
    children: ["Kalem", "Tutar", "Ödeme Zamanı"].map(
      (t, i) =>
        new TableCell({
          width: { size: colWidths[i], type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: INDIGO },
          margins: { top: 90, bottom: 90, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, color: "FFFFFF", size: 19 })] })],
        })
    ),
  });
  const data = [
    ["Lisans Bedeli (tek seferlik)", "[TUTAR]", "Sözleşme imzası / kurulum öncesi"],
    ["Yıllık Destek ve Bakım Bedeli", "Lisans bedelinin [%15-20]'si", "Her yıl, lisans yıl dönümünde"],
    ["Kurulum/Devreye Alma (varsa)", "[TUTAR]", "Kurulum tamamlandığında"],
  ];
  const rows = data.map((cols, idx) => {
    const fill = idx % 2 === 0 ? "FFFFFF" : ROW_ALT;
    return new TableRow({
      children: cols.map(
        (t, i) =>
          new TableCell({
            width: { size: colWidths[i], type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill },
            margins: { top: 90, bottom: 90, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: t, size: 19, color: DARK })] })],
          })
      ),
    });
  });
  return new Table({
    width: { size: colWidths.reduce((a, b) => a + b), type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [header, ...rows],
  });
}

function slaTable() {
  const colWidths = [3200, 3150, 3150];
  const header = new TableRow({
    tableHeader: true,
    children: ["Öncelik", "İlk Yanıt", "Çözüm Hedefi"].map(
      (t, i) =>
        new TableCell({
          width: { size: colWidths[i], type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: INDIGO },
          margins: { top: 90, bottom: 90, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, color: "FFFFFF", size: 19 })] })],
        })
    ),
  });
  const data = [
    ["Kritik (sistem tamamen çalışmıyor)", "[4 saat]", "[1 iş günü]"],
    ["Yüksek (önemli fonksiyon bozuk)", "[1 iş günü]", "[3 iş günü]"],
    ["Normal (küçük hata/soru)", "[2 iş günü]", "[5 iş günü]"],
  ];
  const rows = data.map((cols, idx) => {
    const fill = idx % 2 === 0 ? "FFFFFF" : ROW_ALT;
    return new TableRow({
      children: cols.map(
        (t, i) =>
          new TableCell({
            width: { size: colWidths[i], type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill },
            margins: { top: 90, bottom: 90, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: t, size: 19, color: DARK })] })],
          })
      ),
    });
  });
  return new Table({
    width: { size: colWidths.reduce((a, b) => a + b), type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [header, ...rows],
  });
}

function signOffTable() {
  const colWidths = [3175, 3175, 3175];
  const header = new TableRow({
    tableHeader: true,
    children: ["", "LİSANS VEREN", "LİSANS ALAN"].map(
      (t, i) =>
        new TableCell({
          width: { size: colWidths[i], type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: INDIGO },
          margins: { top: 90, bottom: 90, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, color: "FFFFFF", size: 19 })] })],
        })
    ),
  });
  const fields = ["Unvan", "Ad Soyad", "Tarih", "İmza"];
  const rows = fields.map((label, idx) => {
    const fill = idx % 2 === 0 ? "FFFFFF" : ROW_ALT;
    return new TableRow({
      children: [0, 1, 2].map(
        (col) =>
          new TableCell({
            width: { size: colWidths[col], type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill },
            margins: { top: 200, bottom: 200, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: col === 0 ? label : "", bold: col === 0, size: 19, color: DARK })] })],
          })
      ),
    });
  });
  return new Table({
    width: { size: colWidths.reduce((a, b) => a + b), type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [header, ...rows],
  });
}

const disclaimerShort = "TASLAK — Bu belge hukuki tavsiye değildir, kullanmadan önce bir avukata inceletiniz.";

const doc = new Document({
  styles: { default: { document: { run: { font: "Calibri" } } } },
  sections: [
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: disclaimerShort, size: 15, color: "B91C1C", bold: true })],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "VaultSend — Lisans ve Destek Sözleşmesi (Taslak)", size: 15, color: SLATE })],
            }),
          ],
        }),
      },
      children: [
        // Cover
        new Paragraph({ spacing: { before: 800 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "VaultSend", bold: true, color: INDIGO, size: 56 })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200 },
          children: [new TextRun({ text: "Yazılım Lisans ve Destek Sözleşmesi", color: DARK, size: 30 })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 500 },
          children: [new TextRun({ text: "(TASLAK)", color: "B91C1C", bold: true, size: 26 })],
        }),
        warnBox(
          "UYARI: Bu belge bir taslaktır, hukuki tavsiye değildir. Resmi olarak kullanmadan önce bir avukata inceletmeniz gerekir. Köşeli parantez [ ... ] içindeki alanlar doldurulmalı ve hukuki geçerliliği teyit edilmelidir."
        ),
        p(
          "Bu Sözleşme, aşağıda bilgileri yer alan taraflar arasında [TARİH] tarihinde akdedilmiştir:",
        ),
        twoColTable([
          ["LİSANS VEREN", "[Şirket Unvanınız], [Adres]"],
          ["LİSANS ALAN", "[Müşteri Şirket Unvanı], [Adres]"],
        ]),
        new Paragraph({ children: [new PageBreak()] }),

        h1("1. Tanımlar"),
        p("\"Yazılım\": VaultSend adlı, dosya transfer sistemi olarak sunulan yazılım (kaynak kodu değil, çalışan uygulama olarak)."),
        p("\"Sunucu\": Yazılımın kurulacağı, Lisans Alan'a ait veya Lisans Alan'ın kontrolündeki fiziksel/sanal sunucu."),
        p("\"Kullanıcı\": Yazılımı personel arayüzünden kullanan Lisans Alan çalışanları."),
        p("\"Güncelleme\": Yazılımın hata düzeltme, güvenlik yaması veya küçük özellik eklemelerini içeren sürümleri."),

        h1("2. Lisans Kapsamı"),
        p("2.1. Lisans Veren, Lisans Alan'a, Yazılımı [BİR (1)] adet sunucuya kurmak ve en fazla [KULLANICI SAYISI] kullanıcı için kullanmak üzere, münhasır olmayan (non-exclusive), devredilemez (non-transferable) bir kullanım lisansı verir."),
        p("2.2. Bu lisans; Yazılımın kaynak kodunun tesliminin yapılmadığı, Lisans Alan'ın Yazılımı çoğaltma, tersine mühendislik yapma, alt lisanslama veya üçüncü taraflara devretme hakkı olmadığı şekilde sınırlıdır."),
        p("2.3. Lisans, işbu Sözleşme'nin imza tarihinden itibaren [SÜREKLİ / 1 YIL / ...] geçerlidir."),

        h1("3. Teslimat ve Kurulum"),
        p("3.1. Lisans Veren, Yazılımı kurulum paketi (Docker imajları + kurulum scriptleri) ve kurulum kılavuzu ile birlikte teslim eder."),
        p("3.2. Kurulum, Lisans Veren tarafından uzaktan destekli olarak veya Lisans Alan'ın kendi IT ekibi tarafından kurulum kılavuzuna uygun şekilde gerçekleştirilir."),
        p("3.3. Kurulumun tamamlandığı, taraflarca birlikte imzalanan Kabul Testi (UAT) Formu ile teyit edilir."),

        h1("4. Ücretler ve Ödeme"),
        feeTable(),
        new Paragraph({ spacing: { after: 200 } }),
        p("4.1. Ödemeler [KDV DAHİL/HARİÇ] olarak, fatura tarihinden itibaren [14/30] gün içinde yapılır."),
        p("4.2. Yıllık destek bedeli ödenmediği takdirde Lisans Veren, güncelleme ve destek hizmetini durdurma hakkına sahiptir; Yazılımın kurulu kopyası çalışmaya devam eder ancak destek kapsamı dışında kalır."),

        h1("5. Destek ve Bakım"),
        p("5.1. Destek kapsamı: hata bildirimi, kullanım soruları, güncelleme sağlanması."),
        p("5.2. Destek talebi yanıt süreleri (iş günü içinde):"),
        slaTable(),
        new Paragraph({ spacing: { after: 200 } }),
        p("5.3. Destek, [E-MAIL / TELEFON / DESTEK PORTALI] üzerinden [MESAI SAATLERİ] içinde sağlanır."),
        p("5.4. Güncellemeler Lisans Veren tarafından bildirilir; kurulumu Lisans Alan'ın IT ekibi veya talep halinde Lisans Veren gerçekleştirir."),

        h1("6. Fikri Mülkiyet"),
        p("6.1. Yazılım üzerindeki tüm fikri mülkiyet hakları Lisans Veren'e aittir. Bu Sözleşme, Lisans Alan'a yalnızca kullanım hakkı verir, mülkiyet devri anlamına gelmez."),
        p("6.2. Lisans Alan'ın Yazılım üzerinde yapacağı herhangi bir değişiklik, türetme veya entegrasyon önceden yazılı onay gerektirir."),

        h1("7. Veri Sahipliği ve Gizlilik"),
        p("7.1. Yazılım, Lisans Alan'ın kendi sunucusunda (on-premise) çalışır; Lisans Alan'ın yüklediği dosyalar, personel/alıcı e-mail adresleri ve tüm sistem verileri yalnızca Lisans Alan'ın sunucusunda tutulur, Lisans Veren'e iletilmez veya Lisans Veren'in sunucularında saklanmaz."),
        p("7.2. Destek sürecinde Lisans Veren'in sunucuya erişimi gerekirse, bu erişim önceden Lisans Alan'ın onayı ile ve sınırlı süreli olarak yapılır."),
        p("7.3. Taraflar, Sözleşme kapsamında öğrendikleri birbirlerine ait ticari/teknik bilgileri gizli tutmayı taahhüt eder."),

        h1("8. Garanti ve Sorumluluk Sınırlaması"),
        p("8.1. Lisans Veren, Yazılımın kurulum kılavuzunda belirtilen şekilde çalışacağını taahhüt eder ancak Yazılımın kesintisiz veya hatasız çalışacağına dair açık/zımni garanti vermez."),
        p("8.2. Lisans Veren'in bu Sözleşme'den doğan toplam sorumluluğu, Lisans Alan'ın ödediği son 12 aylık lisans/destek bedeli ile sınırlıdır."),
        bracketNote("8.3. [Bu madde ve dolaylı zarar hariç tutma hükümleri yargı bölgesine/tüketici mevzuatına göre uygulanabilirliği değişebilir — avukat kontrolü gerekir.]"),

        h1("9. Süre ve Fesih"),
        p("9.1. Bu Sözleşme, imza tarihinde başlar ve Madde 2.3'te belirtilen süre boyunca geçerlidir."),
        p("9.2. Taraflardan biri, diğerinin Sözleşme'yi esaslı şekilde ihlal etmesi ve bu ihlalin yazılı bildirimden itibaren [30] gün içinde giderilmemesi halinde Sözleşme'yi feshedebilir."),
        p("9.3. Fesih halinde, Lisans Alan'ın Yazılımı kullanma hakkı sona erer; Lisans Alan kendi verilerini kendi sunucusundan alır — bu veriler zaten hiçbir zaman Lisans Veren'de tutulmamaktadır."),

        h1("10. Uygulanacak Hukuk ve Yetkili Mahkeme"),
        p("Bu Sözleşme Türkiye Cumhuriyeti kanunlarına tabidir. Sözleşme'den doğan ihtilaflarda [ŞEHİR] Mahkemeleri ve İcra Daireleri yetkilidir."),

        h1("11. Diğer Hükümler"),
        p("11.1. Bu Sözleşme, taraflar arasındaki anlaşmanın tamamını oluşturur; önceki sözlü/yazılı anlaşmaların yerini alır."),
        p("11.2. Değişiklikler yalnızca yazılı ve her iki tarafça imzalanmış ek protokol ile yapılabilir."),
        p("11.3. Mücbir sebep hallerinde taraflar edimlerini yerine getirememekten sorumlu tutulamaz."),

        new Paragraph({ spacing: { before: 300, after: 200 } }),
        h1("İmzalar"),
        signOffTable(),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  require("fs").writeFileSync("VaultSend_Lisans_ve_Destek_Sozlesmesi_TASLAK.docx", buffer);
  console.log("OK: VaultSend_Lisans_ve_Destek_Sozlesmesi_TASLAK.docx");
});
