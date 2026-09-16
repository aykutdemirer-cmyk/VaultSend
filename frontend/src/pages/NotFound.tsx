import { Link } from "react-router-dom";
import BrandMark from "../components/BrandMark";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-sm border border-slate-100 text-center">
        <div className="flex justify-center mb-6">
          <BrandMark />
        </div>
        <p className="text-4xl font-semibold text-slate-300">404</p>
        <p className="mt-2 text-slate-500">Sayfa bulunamadı.</p>
        <Link to="/" className="mt-6 inline-block text-brand-600 hover:underline">
          Anasayfaya dön
        </Link>
      </div>
    </div>
  );
}
