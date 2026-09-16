import { useCallback, useRef, useState } from "react";
import { File as FileIcon, Trash2, UploadCloud } from "lucide-react";
import { formatBytes } from "../services/api";

interface Props {
  file: File | null;
  onFileSelected: (file: File) => void;
  onRemove?: () => void;
  disabled?: boolean;
}

export default function FileDropzone({ file, onFileSelected, onRemove, disabled }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const dropped = e.dataTransfer.files?.[0];
      if (dropped) onFileSelected(dropped);
    },
    [onFileSelected, disabled]
  );

  if (file) {
    const extension = file.name.includes(".") ? file.name.split(".").pop()?.toUpperCase() : "";
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
          <FileIcon className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-slate-800">{file.name}</p>
          <p className="text-sm text-slate-500">
            {extension ? `${extension} · ` : ""}
            {formatBytes(file.size)}
          </p>
        </div>
        {onRemove && !disabled && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Dosyayı kaldır"
            className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-5 w-5" strokeWidth={1.75} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
        disabled ? "cursor-not-allowed opacity-60 border-slate-200 bg-slate-50" : "cursor-pointer"
      } ${
        !disabled && dragOver
          ? "border-indigo-500 bg-indigo-50/60"
          : !disabled
            ? "border-indigo-200 bg-indigo-50/30 hover:border-indigo-500 hover:bg-indigo-50/60"
            : ""
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) onFileSelected(selected);
        }}
      />
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm">
        <UploadCloud className="h-7 w-7" strokeWidth={1.75} />
      </div>
      <p className="font-medium text-slate-700">Dosyayı buraya sürükleyin</p>
      <p className="mt-1 text-sm text-slate-400">veya dosya seçin</p>
    </div>
  );
}
