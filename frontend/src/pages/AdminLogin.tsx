import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, apiErrorMessage } from "../services/api";
import { setAdminToken } from "../hooks/useAuth";
import { useBrand } from "../hooks/useBrand";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const brandName = useBrand();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/admin/login", { email, password });
      setAdminToken(res.data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(apiErrorMessage(err, "Giriş başarısız."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-10 shadow-xl">
        <h1 className="text-xl font-semibold text-slate-900">Admin Panel</h1>
        <p className="mt-1 text-sm text-slate-500">{brandName} yönetim girişi</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            required
            autoComplete="username"
            placeholder="Kullanıcı adı"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <input
            type="password"
            required
            placeholder="Parola"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 py-2.5 font-medium text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {loading ? "Giriş yapılıyor..." : "GİRİŞ YAP"}
          </button>
        </form>
      </div>
    </div>
  );
}
