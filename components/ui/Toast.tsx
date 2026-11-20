"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type ToastKind = "ok" | "info" | "error";
type ToastState = { id: number; kind: ToastKind; text: string } | null;

const ToastContext = createContext<(kind: ToastKind, text: string) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

const kindClass: Record<ToastKind, string> = {
  ok: "bg-ok text-paper",
  info: "bg-info-accent text-paper",
  error: "bg-error-accent text-paper",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((kind: ToastKind, text: string) => {
    setToast({ id: Date.now(), kind, text });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed bottom-7 left-1/2 z-50 -translate-x-1/2">
        {toast && (
          <div key={toast.id} className={cn("animate-toast rounded-xl px-4.5 py-3 text-sm font-semibold shadow-toast", kindClass[toast.kind])}>
            {toast.text}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
