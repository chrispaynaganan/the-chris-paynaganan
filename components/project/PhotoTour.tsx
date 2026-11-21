"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, Grid2x2 } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import type { Screenshot } from "@/types/content";
import { Shot } from "./Shot";

const ease = [0.2, 0.7, 0.2, 1] as const;

/** "Show all photos": a full-screen sheet that slides up with every screenshot. */
export function PhotoTour({ name, shots }: { name: string; shots: Screenshot[] }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={buttonClass("secondary", "absolute right-4 bottom-4 h-9 px-3 shadow-float")}
      >
        <Grid2x2 aria-hidden className="size-4" /> Show all photos
      </button>
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={`${name} photos`}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 260, damping: 32 }}
                className="fixed inset-0 z-50 overflow-y-auto bg-paper"
              >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper px-6 py-3 md:px-10">
                  <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label="Close photos" className="flex size-10 cursor-pointer items-center justify-center rounded-full transition hover:bg-surface">
                    <ChevronLeft aria-hidden className="size-5" />
                  </button>
                  <span className="font-medium">{name}</span>
                  <span className="size-10" />
                </div>
                <div className="mx-auto grid max-w-4xl grid-cols-2 gap-2 px-6 py-10">
                  {shots.map((s, i) => (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease, delay: 0.15 + i * 0.08 }}
                      className={i % 3 === 0 ? "col-span-2" : ""}
                    >
                      <Shot shot={s} name={i % 3 === 0 ? name : undefined} alt={i % 2 === 1} className="aspect-4/3 rounded-xl" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
