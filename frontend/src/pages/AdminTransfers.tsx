import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatBytes, formatDateTime } from "../services/api";
import { StatusBadge } from "./AdminDashboard";

interface TransferRow {
  id: string;
  sender_email: string;
  recipient_email: string;
  filename: string;
  file_size: number;
  status: string;
  download_count: number;
  created_at: string;
  expires_at: string;
}

const STATUS_OPTIONS = ["", "UPLOADING", "PROCESSING", "READY", "DOWNLOADED", "EXPIRED", "DELETED", "FAILED"];

export default function AdminTransfers() {
  const [items, setItems] = useState<TransferRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ sender: "", recipient: "", filename: "", status: "" });

  useEffect(() => {
    const params: Record<string, string | number> = { page, page_size: 20 };
    if (filters.sender) params.sender = filters.sender;
    if (filters.recipient) params.recipient = filters.recipient;
    if (filters.filename) params.filename = filters.filename;
    if (filters.status) params.status = filters.status;

    api.get("/admin/transfers", { params }).then((res) => {
      setItems(res.data.items);
      setTotalPages(res.data.total_pages);
    });
  }, [page, filters]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Transferler</h1>

      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <input
          placeholder="Gönderen"
          value={filters.sender}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, sender: e.target.value }));
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          placeholder="Alıcı"
          value={filters.recipient}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, recipient: e.target.value }));
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          placeholder="Dosya adı"
          value={filters.filename}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, filename: e.target.value }));
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={filters.status}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, status: e.target.value }));
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s || "Tüm Durumlar"}
            </option>
          ))}
        </select>
      </div>

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
              <th className="px-4 py-3">Download</th>
              <th className="px-4 py-3">Son Geçerlilik</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
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
                <td className="px-4 py-3">{t.download_count}</td>
                <td className="px-4 py-3">{formatDateTime(t.expires_at)}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                  Kayıt bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
        >
          Önceki
        </button>
        <span className="text-slate-500">
          Sayfa {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
        >
          Sonraki
        </button>
      </div>
    </div>
  );
}
