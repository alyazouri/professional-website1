import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "../utils/cn";

type ToastType = "success" | "error" | "info" | "warning";
type Toast = { id: string; type: ToastType; message: string; duration?: number };

let listeners: ((t: Toast) => void)[] = [];

export const toast = {
  success: (m: string, d = 3000) => emit("success", m, d),
  error: (m: string, d = 4000) => emit("error", m, d),
  info: (m: string, d = 3000) => emit("info", m, d),
  warning: (m: string, d = 3500) => emit("warning", m, d),
};

function emit(type: ToastType, message: string, duration: number) {
  const t: Toast = { id: Math.random().toString(36).slice(2), type, message, duration };
  listeners.forEach((l) => l(t));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((t: Toast) => {
    setToasts((prev) => [...prev, t]);
    if (t.duration) {
      setTimeout(() => setToasts((p) => p.filter((x) => x.id !== t.id)), t.duration);
    }
  }, []);

  useEffect(() => {
    listeners.push(add);
    return () => {
      listeners = listeners.filter((l) => l !== add);
    };
  }, [add]);

  const remove = (id: string) => setToasts((p) => p.filter((x) => x.id !== id));

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
    error: <XCircle className="h-5 w-5 text-rose-400" />,
    info: <Info className="h-5 w-5 text-sky-400" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-400" />,
  };

  const borders: Record<ToastType, string> = {
    success: "border-emerald-400/30",
    error: "border-rose-400/30",
    info: "border-sky-400/30",
    warning: "border-amber-400/30",
  };

  return (
    <div className="pointer-events-none fixed left-4 right-4 top-20 z-[1000] flex flex-col items-center gap-2 sm:left-auto sm:right-4 sm:max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "toast-item pointer-events-auto flex w-full items-center gap-3 rounded-xl border bg-black/90 px-4 py-3 shadow-2xl backdrop-blur-xl",
            borders[t.type],
          )}
        >
          {icons[t.type]}
          <div className="flex-1 text-sm">{t.message}</div>
          <button
            onClick={() => remove(t.id)}
            className="opacity-50 transition hover:opacity-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
