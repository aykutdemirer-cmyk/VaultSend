import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { formatBytes, formatDateTime } from "../services/api";
import BrandMark from "../components/BrandMark";

export default function SendSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { transfer?: any; filename?: string; fileSize?: number } | null;

  const [copied, setCopied] = useState(false);

  if (!state?.transfer) {
    navigate("/");
    return null;
  }

  const { transfer } = state;
  const downloadLink = `${window.location.origin}/d/${transfer.download_token}`;

  function handleCopy() {
    navigator.clipboard.writeText(downloadLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-sm border border-slate-100 text-center">
        <div className="flex justify-center mb-6">
          <BrandMark />
        </div>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
          ✓
        </div>
        <h1 className="text-xl font-semibold text-slate-900">Dosya başarıyla gönderildi</h1>
        <p className="mt-1 text-sm text-slate-500">Alıcıya indirme linkini içeren bir e-mail gönderildi.</p>

        <div className="mt-6 space-y-3 text-left text-sm">
          <Row label="Dosya" value={transfer.filename} />
          <Row label="Boyut" value={formatBytes(transfer.file_size)} />
          <Row label="Alıcı" value={transfer.recipient_email} />
          <Row label="Link geçerliliği" value={formatDateTime(transfer.expires_at)} />
          {transfer.subject && <Row label="Konu Başlığı" value={transfer.subject} />}
        </div>

        {transfer.message && (
          <div className="mt-4 rounded-lg bg-slate-50 p-4 text-left text-sm text-slate-600 whitespace-pre-wrap">
            {transfer.message}
          </div>
        )}

        <button
          onClick={handleCopy}
          className="mt-8 w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 transition-colors"
        >
          {copied ? "KOPYALANDI ✓" : "LİNKİ KOPYALA"}
        </button>

        <button
          onClick={() => navigate("/upload")}
          className="mt-3 w-full text-sm text-brand-600 hover:underline"
        >
          Yeni transfer başlat
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-100 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
