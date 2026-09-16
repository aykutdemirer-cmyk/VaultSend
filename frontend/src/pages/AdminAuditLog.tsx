import { useEffect, useState } from "react";
import { api, formatDateTime } from "../services/api";

interface AuditRow {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string | null;
  ip_address: string | null;
  result: string;
}

export default function AdminAuditLog() {
  const [items, setItems] = useState<AuditRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actor, setActor] = useState("");

  useEffect(() => {
    api.get("/admin/audit-log", { params: { page, page_size: 50, actor: actor || undefined } }).then((res) => {
      setItems(res.data.items);
      setTotalPages(res.data.total_pages);
    });
  }, [page, actor]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Audit Log</h1>

      <input
        placeholder="Aktöre göre filtrele (e-mail)"
        value={actor}
        onChange={(e) => {
          setPage(1);
          setActor(e.target.value);
        }}
        className="mb-4 w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />

      <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Zaman</th>
              <th className="px-4 py-3">Aktör</th>
              <th className="px-4 py-3">İşlem</th>
              <th className="px-4 py-3">Kaynak</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3">Sonuç</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">{formatDateTime(row.timestamp)}</td>
                <td className="px-4 py-3">{row.actor}</td>
                <td className="px-4 py-3 font-mono text-xs">{row.action}</td>
                <td className="px-4 py-3">{row.resource ?? "-"}</td>
                <td className="px-4 py-3">{row.ip_address ?? "-"}</td>
                <td className="px-4 py-3">{row.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40">
          Önceki
        </button>
        <span className="text-slate-500">
          Sayfa {page} / {totalPages}
        </span>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40">
          Sonraki
        </button>
      </div>
    </div>
  );
}
