import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api, formatBytes } from "../services/api";
import BrandMark from "../components/BrandMark";

interface DownloadInfo {
  filename: string;
  file_size: number;
  sender_email: string;
  message: string | null;
  expires_at: string;
  status: string;
  download_count: number;
  max_downloads: number;
}

export default function Download() {
  const { token } = useParams<{ token: string }>();
  const [info, setInfo] = useState<DownloadInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    api
      .get(`/d/${token}`)
      .then((res) => setInfo(res.data))
      .catch(() => setError("Bu bağlantı bulunamadı."));
  }, [token]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const isExpired = useMemo(() => {
    if (!info) return false;
    if (["EXPIRED", "DELETED", "FAILED"].includes(info.status)) return true;
    if (new Date(info.expires_at).getTime() < now) return true;
    if (info.max_downloads && info.download_count >= info.max_downloads) return true;
    return false;
  }, [info, now]);

  const remaining = useMemo(() => {
    if (!info) return "";
    const diffMs = new Date(info.expires_at).getTime() - now;
    if (diffMs <= 0) return "";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} saat ${minutes} dakika`;
  }, [info, now]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-sm border border-slate-100 text-center">
        <div className="flex justify-center mb-6">
          <BrandMark />
        </div>

        {!info && !error && <p className="text-slate-400">Yükleniyor...</p>}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-100">{error}</p>
        )}

        {info && !error && (
          <>
            <p className="text-slate-600">
              <strong>{info.sender_email}</strong> size bir dosya gönderdi.
            </p>

            <div className="mt-6 rounded-xl bg-slate-50 p-6">
              <p className="text-lg">📄 {info.filename}</p>
              <p className="mt-1 text-slate-500">{formatBytes(info.file_size)}</p>
            </div>

            {info.message && (
              <div className="mt-4 rounded-lg bg-slate-50 p-4 text-left text-sm text-slate-600 whitespace-pre-wrap">
                {info.message}
              </div>
            )}

            {isExpired ? (
              <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-100">
                Bu dosyanın indirme bağlantısının süresi dolmuştur.
              </p>
            ) : (
              <>
                <p className="mt-4 text-sm text-slate-500">Link geçerliliği: {remaining}</p>
                {info.max_downloads > 0 && (
                  <p className="mt-1 text-sm text-slate-400">
                    İndirme: {info.download_count} / {info.max_downloads}
                  </p>
                )}
                <a
                  href={`/api/d/${token}/file`}
                  className="mt-6 inline-block w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 transition-colors"
                >
                  DOSYAYI İNDİR
                </a>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
