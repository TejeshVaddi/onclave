"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, Info, AlertCircle, X } from "lucide-react";
import type { Pillar } from "@/types";
import { cn } from "@/lib/utils";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: "success" | "info" | "error";
  pillar?: Pillar;
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  toast: (opts: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS = {
  success: CheckCircle2,
  info: Info,
  error: AlertCircle,
};

const PILLAR_ACCENT: Record<Pillar, string> = {
  community: "border-l-green",
  culture: "border-l-berry",
  profession: "border-l-terracotta",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (opts: ToastOptions) => {
      const id = ++counter.current;
      setToasts((t) => [...t.slice(-2), { id, variant: "success", ...opts }]);
      const duration = opts.duration ?? 4000;
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4 md:inset-x-auto md:bottom-6 md:right-6 md:items-end"
      >
        {toasts.map((t) => {
          const Icon = ICONS[t.variant ?? "success"];
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-beige bg-cream px-4 py-3 shadow-lift animate-toast-in border-l-4",
                t.pillar ? PILLAR_ACCENT[t.pillar] : t.variant === "error" ? "border-l-berry" : "border-l-brown",
              )}
            >
              <Icon
                className={cn(
                  "mt-0.5 h-5 w-5 shrink-0",
                  t.variant === "error" ? "text-berry" : t.pillar === "community" ? "text-green" : t.pillar === "culture" ? "text-berry" : t.pillar === "profession" ? "text-terracotta" : "text-green",
                )}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-brown">{t.title}</p>
                {t.description ? <p className="mt-0.5 text-sm text-brown-muted">{t.description}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="-mr-1 -mt-1 rounded-full p-1 text-brown-faint transition hover:bg-beige-soft hover:text-brown"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
