import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { clearAdminToken, getAdminToken } from "../hooks/useAuth";
import { useBrand } from "../hooks/useBrand";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/transfers", label: "Transferler" },
  { to: "/admin/audit-log", label: "Audit Log" },
  { to: "/admin/settings", label: "Ayarlar" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const brandName = useBrand();

  if (!getAdminToken()) {
    return <Navigate to="/admin/login" replace />;
  }

  function handleLogout() {
    clearAdminToken();
    navigate("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-60 shrink-0 bg-slate-900 text-slate-200 flex flex-col">
        <div className="px-6 py-5 text-lg font-semibold text-white">{brandName}</div>
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={handleLogout} className="mx-3 mb-5 rounded-lg px-3 py-2 text-left text-sm text-slate-400 hover:bg-slate-800 hover:text-white">
          Çıkış Yap
        </button>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
