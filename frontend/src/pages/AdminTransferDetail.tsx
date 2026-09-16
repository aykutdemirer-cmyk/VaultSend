import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, formatBytes, formatDateTime } from "../services/api";
import { StatusBadge } from "./AdminDashboard";

interface Detail {
  sender_email: string;
  recipient_email: string;
  filename: string;
  file_size: number;
  subject: string | null;
  message: string | null;
  created_at: string;
  expires_at: string;
  download_count: number;
  status: string;
  activity: { timestamp: string; action: string; result: string }[];
}

export default function AdminTransferDetail() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<Detail | null>(null);

  useEffect(() => {
    api.get(`/admin/transfers/${id}`).then((res) => setDetail(res.data));
  }, [id]);

  if (!detail) return <p className="text-slate-500">Yükleniyor...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Transfer Detayı</h1>

      <div className="rounded-xl border border-slate-100 bg-white p-6 grid grid-cols-2 gap-4 text-sm">
        <Row label="Gönderen" value={detail.sender_email} />
        <Row label="Alıcı" value={detail.recipient_email} />
        <Row label="Dosya" value={detail.filename} />
        <Row label="Boyut" value={formatBytes(detail.file_size)} />
        <Row label="Oluşturulma" value={formatDateTime(detail.created_at)} />
        <Row label="Son Geçerlilik" value={formatDateTime(detail.expires_at)} />
        <Row label="Download" value={String(detail.download_count)} />
        <div>
          <p className="text-slate-500">Durum</p>
          <StatusBadge status={detail.status} />
        </div>
      </div>

      {(detail.subject || detail.message) && (
        <div className="mt-6 rounded-xl border border-slate-100 bg-white p-6 text-sm space-y-3">
          {detail.subject && <Row label="Konu Başlığı" value={detail.subject} />}
          {detail.message && (
            <div>
              <p className="text-slate-500">Mesaj</p>
              <p className="mt-1 whitespace-pre-wrap text-slate-800">{detail.message}</p>
            </div>
          )}
        </div>
      )}

      <h2 className="mt-8 mb-3 text-lg font-semibold text-slate-800">Aktivite Geçmişi</h2>
      <div className="rounded-xl border border-slate-100 bg-white divide-y divide-slate-100">
        {detail.activity.map((a, idx) => (
          <div key={idx} className="flex justify-between px-4 py-3 text-sm">
            <span className="text-slate-700">{a.action}</span>
            <span className="text-slate-400">{formatDateTime(a.timestamp)}</span>
          </div>
        ))}
        {detail.activity.length === 0 && <p className="px-4 py-6 text-center text-slate-400">Aktivite bulunamadı.</p>}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-500">{label}</p>
      <p className="font-medium text-slate-800">{value}</p>
    </div>
  );
}
