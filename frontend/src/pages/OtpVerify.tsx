import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api, apiErrorMessage } from "../services/api";
import { setSenderSession } from "../hooks/useAuth";
import BrandMark from "../components/BrandMark";

export default function OtpVerify() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as { email?: string })?.email ?? "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  if (!email) {
    navigate("/");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/otp/verify", { email, code });
      setSenderSession(res.data.email, res.data.session_token);
      navigate("/upload");
    } catch (err) {
      setError(apiErrorMessage(err, "Doğrulama başarısız."));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    setResent(false);
    try {
      await api.post("/auth/otp/request", { email });
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch (err) {
      setError(apiErrorMessage(err, "Kod gönderilemedi."));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-sm border border-slate-100">
        <BrandMark />
        <p className="mt-3 text-slate-500">
          <strong className="text-slate-700">{email}</strong> adresine gönderilen doğrulama kodunu girin.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="text"
            inputMode="numeric"
            required
            maxLength={8}
            autoFocus
            placeholder="583921"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-center text-2xl tracking-widest focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-100">{error}</p>
          )}
          {resent && !error && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 border border-green-100">
              Yeni kod gönderildi.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Doğrulanıyor..." : "KODU DOĞRULA"}
          </button>

          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={handleResend} className="text-brand-600 hover:underline">
              Kodu tekrar gönder
            </button>
            <button type="button" onClick={() => navigate("/")} className="text-slate-400 hover:underline">
              Farklı e-mail kullan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
