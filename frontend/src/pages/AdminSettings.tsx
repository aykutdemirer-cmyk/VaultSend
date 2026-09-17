import { useEffect, useState } from "react";
import { api, apiErrorMessage } from "../services/api";
import { useBrand } from "../hooks/useBrand";

interface SettingsData {
  max_file_size_gb: number;
  default_link_ttl_hours: number;
  max_link_ttl_hours: number;
  max_downloads: number;
  expired_retention_hours: number;
  blocked_extensions: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_from: string;
  smtp_tls: boolean;
  smtp_verify_cert: boolean;
  smtp_password_set: boolean;
}

export default function AdminSettings() {
  const brandName = useBrand();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [smtpPassword, setSmtpPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [testEmail, setTestEmail] = useState("");
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/admin/settings").then((res) => setSettings(res.data));
  }, []);

  if (!settings) return <p className="text-slate-500">Yükleniyor...</p>;

  function update<K extends keyof SettingsData>(key: K, value: SettingsData[K]) {
    setSettings((s) => (s ? { ...s, [key]: value } : s));
  }

  async function handleSave() {
    if (!settings) return;
    setSaveError(null);
    try {
      const payload: Record<string, unknown> = { ...settings };
      delete payload.smtp_password_set;
      if (smtpPassword) payload.smtp_password = smtpPassword;

      const res = await api.put("/admin/settings", payload);
      setSettings(res.data);
      setSmtpPassword("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(apiErrorMessage(err, "Ayarlar kaydedilemedi."));
    }
  }

  async function handleTestEmail() {
    if (!testEmail) return;
    setTestStatus("sending");
    setTestError(null);
    try {
      await api.post("/admin/settings/test-email", { to_email: testEmail });
      setTestStatus("sent");
    } catch (err) {
      setTestStatus("error");
      setTestError(apiErrorMessage(err, "Test e-maili gönderilemedi."));
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Ayarlar</h1>

      <div className="max-w-lg rounded-xl border border-slate-100 bg-white p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Transfer Ayarları</h2>

        <Field label="Maksimum Dosya Boyutu (GB)">
          <input
            type="number"
            min={1}
            value={settings.max_file_size_gb}
            onChange={(e) => update("max_file_size_gb", Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </Field>

        <Field label="Varsayılan Link Geçerliliği (Saat)">
          <input
            type="number"
            min={1}
            value={settings.default_link_ttl_hours}
            onChange={(e) => update("default_link_ttl_hours", Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </Field>

        <Field label="Maksimum Link Geçerliliği (Saat)">
          <input
            type="number"
            min={1}
            value={settings.max_link_ttl_hours}
            onChange={(e) => update("max_link_ttl_hours", Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </Field>

        <Field label="Maksimum İndirme (0 = Sınırsız)">
          <input
            type="number"
            min={0}
            value={settings.max_downloads}
            onChange={(e) => update("max_downloads", Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </Field>

        <Field label="Süresi Dolan Dosya Saklama Süresi (Saat)">
          <input
            type="number"
            min={0}
            value={settings.expired_retention_hours}
            onChange={(e) => update("expired_retention_hours", Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </Field>

        <Field label="Yasaklı Dosya Uzantıları (virgülle ayrılmış)">
          <input
            type="text"
            value={settings.blocked_extensions}
            onChange={(e) => update("blocked_extensions", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </Field>
      </div>

      <div className="max-w-lg rounded-xl border border-slate-100 bg-white p-6 space-y-5 mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Mail (SMTP) Ayarları</h2>

        <Field label="SMTP Sunucu">
          <input
            type="text"
            placeholder="smtp.ofis365.com"
            value={settings.smtp_host}
            onChange={(e) => update("smtp_host", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </Field>

        <Field label="SMTP Port">
          <input
            type="number"
            value={settings.smtp_port}
            onChange={(e) => update("smtp_port", Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </Field>

        <Field label="SMTP Kullanıcı Adı">
          <input
            type="text"
            value={settings.smtp_username}
            onChange={(e) => update("smtp_username", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </Field>

        <Field label={`SMTP Parola${settings.smtp_password_set ? " (kayıtlı — değiştirmek için yazın)" : ""}`}>
          <input
            type="password"
            placeholder={settings.smtp_password_set ? "••••••••" : ""}
            value={smtpPassword}
            onChange={(e) => setSmtpPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </Field>

        <Field label="Gönderen Adresi (From)">
          <input
            type="text"
            placeholder={`${brandName} <no-reply@firma.com>`}
            value={settings.smtp_from}
            onChange={(e) => update("smtp_from", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </Field>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={settings.smtp_tls}
            onChange={(e) => update("smtp_tls", e.target.checked)}
          />
          TLS kullan
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={settings.smtp_verify_cert}
            onChange={(e) => update("smtp_verify_cert", e.target.checked)}
          />
          Sertifika doğrulaması yap (iç/self-signed sunucularda kapatın)
        </label>

        {saveError && <p className="text-sm text-red-600">{saveError}</p>}

        <button
          onClick={handleSave}
          className="w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 transition-colors"
        >
          {saved ? "Kaydedildi ✓" : "Kaydet"}
        </button>

        <div className="border-t border-slate-100 pt-4">
          <p className="text-sm font-medium text-slate-700 mb-2">Ayarları Test Et</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="test@firma.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              onClick={handleTestEmail}
              disabled={testStatus === "sending" || !testEmail}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              {testStatus === "sending" ? "Gönderiliyor..." : "Test Mail Gönder"}
            </button>
          </div>
          {testStatus === "sent" && <p className="mt-2 text-sm text-green-600">Test e-maili gönderildi ✓</p>}
          {testStatus === "error" && <p className="mt-2 text-sm text-red-600">{testError}</p>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
