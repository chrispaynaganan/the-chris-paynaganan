"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { buttonClass } from "./button";

const ease = [0.2, 0.7, 0.2, 1] as const;

/**
 * Full-screen "done" moment after a form, like a booking confirmation.
 * The forms open the visitor's email app, so it says exactly that: the message is ready to send.
 */
export function Confirmation({
  open,
  onClose,
  title,
  steps,
  dark = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  steps: string[];
  dark?: boolean;
}) {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed inset-0 z-60 flex items-center justify-center px-gutter ${dark ? "bg-ink text-paper" : "bg-paper text-ink"}`}
        >
          <motion.div
            initial={reduce ? false : { y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
            className="flex w-full max-w-lg flex-col items-center gap-8 text-center"
          >
            {/* The check draws itself inside a circle that fills */}
            <motion.span
              initial={reduce ? false : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.15 }}
              className="flex size-24 items-center justify-center rounded-full bg-ok"
            >
              <svg viewBox="0 0 24 24" className="size-12 text-paper" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <motion.path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.45 }}
                />
              </svg>
            </motion.span>
            <div className="flex flex-col gap-3">
              <h2 id="confirm-title" className="text-3xl font-semibold tracking-tight">
                {title}
              </h2>
              <p className={dark ? "text-paper/70" : "text-body"}>Here’s what happens next.</p>
            </div>
            <ol className="flex w-full flex-col gap-3 text-left">
              {steps.map((s, i) => (
                <motion.li
                  key={s}
                  initial={reduce ? false : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease, delay: 0.7 + i * 0.12 }}
                  className={`flex items-center gap-4 rounded-2xl border p-4 ${dark ? "border-paper/15" : "border-line-strong"}`}
                >
                  <span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${dark ? "bg-paper text-ink" : "bg-ink text-paper"}`}>
                    {i + 1}
                  </span>
                  <span className="text-sm">{s}</span>
                </motion.li>
              ))}
            </ol>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/" onClick={onClose} className={buttonClass("primary", undefined, dark)}>
                Back to projects
              </Link>
              <button ref={closeRef} type="button" onClick={onClose} className={buttonClass("tertiary", undefined, dark)}>
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
