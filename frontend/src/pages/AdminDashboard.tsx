import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatBytes, formatDateTime } from "../services/api";

interface DashboardData {
  total_transfers: number;
  today_transfers: number;
  total_bytes: number;
  active_links: number;
  recent_transfers: any[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get("/admin/dashboard").then((res) => setData(res.data));
  }, []);

  if (!data) return <p className="text-slate-500">Yükleniyor...</p>;

  const cards = [
    { label: "Toplam Transfer", value: data.total_transfers },
    { label: "Bugünkü Transfer", value: data.today_transfers },
    { label: "Toplam Veri", value: formatBytes(data.total_bytes) },
    { label: "Aktif Link", value: data.active_links },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="text-3xl font-semibold text-slate-900">{card.value}</div>
            <div className="mt-1 text-sm text-slate-500">{card.label}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-8 mb-3 text-lg font-semibold text-slate-800">Son Transferler</h2>
      <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3">Gönderen</th>
              <th className="px-4 py-3">Alıcı</th>
              <th className="px-4 py-3">Dosya</th>
              <th className="px-4 py-3">Boyut</th>
              <th className="px-4 py-3">Durum</th>
            </tr>
          </thead>
          <tbody>
            {data.recent_transfers.map((t) => (
              <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">{formatDateTime(t.created_at)}</td>
                <td className="px-4 py-3">{t.sender_email}</td>
                <td className="px-4 py-3">{t.recipient_email}</td>
                <td className="px-4 py-3">
                  <Link to={`/admin/transfers/${t.id}`} className="text-brand-600 hover:underline">
                    {t.filename}
                  </Link>
                </td>
                <td className="px-4 py-3">{formatBytes(t.file_size)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    READY: "bg-blue-100 text-blue-700",
    DOWNLOADED: "bg-green-100 text-green-700",
    EXPIRED: "bg-slate-200 text-slate-600",
    DELETED: "bg-slate-200 text-slate-500",
    FAILED: "bg-red-100 text-red-700",
    UPLOADING: "bg-yellow-100 text-yellow-700",
    PROCESSING: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${colors[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}
