"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";

type ToastKind = "ok" | "info" | "error";
/** A richer toast: a thumbnail and a link, like a wishlist confirmation. */
type Rich = { thumb?: string; title?: string; action?: { label: string; href: string } };
type ToastState = ({ id: number; kind: ToastKind; text: string } & Rich) | null;
type Show = (kind: ToastKind, text: string, rich?: Rich) => void;

const ToastContext = createContext<Show>(() => {});

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

  const show = useCallback<Show>((kind, text, rich) => {
    setToast({ id: Date.now(), kind, text, ...rich });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), rich ? 4200 : 2800);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const rich = toast && (toast.thumb !== undefined || toast.action);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 md:bottom-7">
        <AnimatePresence mode="popLayout">
          {toast &&
            (rich ? (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-card bg-paper p-2.5 pr-4 text-ink shadow-float"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-placeholder text-sm font-medium">
                  {toast.thumb}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">{toast.text}</span>
                  {toast.title && <span className="truncate text-sm text-muted">{toast.title}</span>}
                </span>
                {toast.action && (
                  <Link href={toast.action.href} onClick={() => setToast(null)} className="shrink-0 text-sm font-medium underline underline-offset-4 hover:decoration-2">
                    {toast.action.label}
                  </Link>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className={cn("rounded-xl px-4.5 py-3 text-sm font-medium shadow-float", kindClass[toast.kind])}
              >
                {toast.text}
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
