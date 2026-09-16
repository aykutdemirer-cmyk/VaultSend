import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Loader2 } from "lucide-react";
import FileDropzone from "../components/FileDropzone";
import BrandMark from "../components/BrandMark";
import { clearSenderSession, getSenderSession } from "../hooks/useAuth";
import { useChunkedUpload } from "../hooks/useChunkedUpload";
import { formatBytes } from "../services/api";

const TTL_OPTIONS = [
  { label: "6 Saat", value: 6 },
  { label: "24 Saat", value: 24 },
  { label: "3 Gün", value: 72 },
  { label: "7 Gün", value: 168 },
];

const inputClass =
  "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed";

function OptionalBadge() {
  return (
    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-400 align-middle">
      opsiyonel
    </span>
  );
}

export default function Upload() {
  const navigate = useNavigate();
  const session = getSenderSession();
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [ttlHours, setTtlHours] = useState(24);
  const { uploading, progress, uploadedBytes, error, upload } = useChunkedUpload();

  if (!session) {
    navigate("/");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    try {
      const transfer = await upload({ file, recipientEmail: recipient, ttlHours, subject, message });
      navigate("/sent", { state: { transfer, filename: file.name, fileSize: file.size } });
    } catch {
      // error state already surfaced by hook
    }
  }

  function handleLogout() {
    clearSenderSession();
    navigate("/");
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden px-4 py-12"
      style={{
        backgroundColor: "#f8fafc",
        backgroundImage:
          "radial-gradient(circle at 15% 10%, rgba(99,102,241,0.08), transparent 45%), radial-gradient(circle at 85% 90%, rgba(139,92,246,0.08), transparent 45%), linear-gradient(180deg, #f8fafc 0%, #f1f0fd 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(99,102,241,0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative mx-auto w-full max-w-lg">
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-2xl shadow-indigo-100/60">
          <div className="flex items-center justify-between">
            <BrandMark />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
              Çıkış
            </button>
          </div>

          <h2 className="mt-6 text-lg font-semibold text-slate-800">Dosya Gönder</h2>

          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-300 text-[10px] font-semibold text-white">
              {session.email.charAt(0).toUpperCase()}
            </span>
            {session.email}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alıcı E-mail</label>
              <input
                type="email"
                required
                placeholder="musteri@firma.com"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                disabled={uploading}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Konu Başlığı
                <OptionalBadge />
              </label>
              <input
                type="text"
                maxLength={255}
                placeholder={`${session.email} size bir dosya gönderdi`}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={uploading}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mesajınız
                <OptionalBadge />
              </label>
              <textarea
                rows={3}
                maxLength={5000}
                placeholder="Alıcıya iletmek istediğiniz bir not yazabilirsiniz..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={uploading}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dosya</label>
              <FileDropzone
                file={file}
                onFileSelected={setFile}
                onRemove={() => setFile(null)}
                disabled={uploading}
              />
            </div>

            {uploading && file && (
              <div>
                <div className="flex justify-between text-sm text-slate-600 mb-1">
                  <span>{file.name}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {formatBytes(uploadedBytes)} / {formatBytes(file.size)}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Link geçerlilik süresi</label>
              <select
                value={ttlHours}
                onChange={(e) => setTtlHours(Number(e.target.value))}
                disabled={uploading}
                className={inputClass}
              >
                {TTL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-100">{error}</p>
            )}

            <button
              type="submit"
              disabled={uploading || !file}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 font-medium text-white shadow-lg shadow-indigo-200 transition-all hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              {uploading && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />}
              {uploading ? "Gönderiliyor..." : "DOSYAYI GÖNDER"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
