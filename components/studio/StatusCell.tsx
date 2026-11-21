"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { fill, type Label } from "./colors";

/** A Monday status cell: the whole cell is the colored label; click it to pick another. */
export function StatusCell({
  value,
  labels,
  onChange,
  label,
  className,
}: {
  value: string;
  labels: Label[];
  onChange: (v: string) => void;
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = labels.find((l) => l.value === value) ?? labels[0];

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative h-full", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${current?.label}`}
        onClick={() => setOpen((o) => !o)}
        className={cn("flex h-full w-full cursor-pointer items-center justify-center px-2 text-sm transition hover:brightness-95", current && fill[current.color])}
      >
        <span className="truncate">{current?.label}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label={label}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="absolute top-full left-1/2 z-40 mt-1 flex w-52 -translate-x-1/2 flex-col gap-1.5 rounded-lg border border-studio-line-soft bg-paper p-2 shadow-float"
          >
            {labels.map((l) => (
              <li key={l.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={l.value === value}
                  onClick={() => {
                    onChange(l.value);
                    setOpen(false);
                  }}
                  className={cn("flex h-8 w-full cursor-pointer items-center justify-center rounded-sm text-sm transition hover:brightness-95", fill[l.color])}
                >
                  {l.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/** A read-only label pill (Kanban cards, panel headers). */
export function Pill({ labels, value, className }: { labels: Label[]; value: string; className?: string }) {
  const l = labels.find((x) => x.value === value) ?? labels[0];
  return <span className={cn("inline-flex h-6 items-center rounded-sm px-2 text-xs font-medium", l && fill[l.color], className)}>{l?.label}</span>;
}
