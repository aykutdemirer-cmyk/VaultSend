import { ShieldCheck } from "lucide-react";
import { useBrand } from "../hooks/useBrand";

export default function BrandMark({ className = "" }: { className?: string }) {
  const brandName = useBrand();
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-200">
        <ShieldCheck className="h-5 w-5" strokeWidth={2.25} />
      </div>
      <span className="text-xl font-semibold text-slate-900">{brandName}</span>
    </div>
  );
}
