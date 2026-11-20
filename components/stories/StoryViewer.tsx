"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Pause, Play, X } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import type { StoryProject } from "./types";

const SLIDE_MS = 6500;
const ease = [0.2, 0.7, 0.2, 1] as const;

/**
 * Full-screen, tap-through stories of each project's diary.
 * Tap right or press → for next, tap left or ← for back, hold or Space to pause, Esc to close.
 */
export function StoryViewer({ projects, start, onClose, onSeen }: { projects: StoryProject[]; start: number; onClose: () => void; onSeen?: (slug: string) => void }) {
  const [p, setP] = useState(start);
  const [e, setE] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState(1);
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const project = projects[p];
  const entry = project.entries[e];

  const next = useCallback(() => {
    setDir(1);
    setProgress(0);
    if (e < project.entries.length - 1) return setE(e + 1);
    onSeen?.(project.slug);
    if (p < projects.length - 1) {
      setP(p + 1);
      setE(0);
    } else onClose();
  }, [e, p, project, projects.length, onClose, onSeen]);

  const prev = useCallback(() => {
    setDir(-1);
    setProgress(0);
    if (e > 0) return setE(e - 1);
    if (p > 0) {
      setP(p - 1);
      setE(projects[p - 1].entries.length - 1);
    }
  }, [e, p, projects]);

  // The timer behind the progress bars; when a slide fills up, move on
  const nextRef = useRef(next);
  useEffect(() => {
    nextRef.current = next;
  }, [next]);
  const elapsed = useRef(0);
  useEffect(() => {
    elapsed.current = 0;
  }, [p, e]);
  useEffect(() => {
    if (paused) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      elapsed.current = Math.min(1, elapsed.current + (now - last) / SLIDE_MS);
      last = now;
      setProgress(elapsed.current);
      if (elapsed.current >= 1) {
        nextRef.current();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, p, e]);

  // Keyboard, focus, scroll lock, pause when the tab is hidden
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onClose();
      if (ev.key === "ArrowRight") next();
      if (ev.key === "ArrowLeft") prev();
      if (ev.key === " ") {
        ev.preventDefault();
        setPaused((x) => !x);
      }
    };
    const onVis = () => document.hidden && setPaused(true);
    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [next, prev, onClose]);

  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const held = useRef(false);
  const onDown = () => {
    held.current = false;
    hold.current = setTimeout(() => {
      held.current = true;
      setPaused(true);
    }, 220);
  };
  const onUp = (side: "left" | "right") => {
    if (hold.current) clearTimeout(hold.current);
    if (held.current) {
      setPaused(false);
      return;
    }
    if (side === "left") prev();
    else next();
  };

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${project.name} story`}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, ease }}
      className="fixed inset-0 z-60 flex items-center justify-center bg-ink text-paper"
    >
      <div className="relative flex h-full w-full max-w-xl flex-col px-5 pt-4 pb-6 md:h-11/12 md:rounded-3xl md:border md:border-paper/15">
        {/* Progress bars, one per diary entry */}
        <div className="flex gap-1.5" aria-hidden>
          {project.entries.map((x, i) => (
            <span key={x.stage} className="h-1 flex-1 overflow-hidden rounded-full bg-paper/25">
              <span
                className="block h-full origin-left rounded-full bg-paper"
                style={{ transform: `scaleX(${i < e ? 1 : i === e ? progress : 0})` }}
              />
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-4">
          <span className="flex size-10 items-center justify-center rounded-full border border-paper/40 text-sm font-medium">
            {project.name.slice(0, 2).toUpperCase()}
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-medium">{project.name}</span>
            <span className="truncate text-sm text-paper/60">{project.years}</span>
          </span>
          <button type="button" onClick={() => setPaused((x) => !x)} aria-label={paused ? "Play" : "Pause"} className="flex size-10 cursor-pointer items-center justify-center rounded-full transition hover:bg-paper/10">
            {paused ? <Play aria-hidden className="size-4.5" /> : <Pause aria-hidden className="size-4.5" />}
          </button>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close story" className="flex size-10 cursor-pointer items-center justify-center rounded-full transition hover:bg-paper/10">
            <X aria-hidden className="size-5" />
          </button>
        </div>

        <div className="relative flex flex-1 flex-col justify-center overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={`${project.slug}-${e}`}
              custom={dir}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.35, ease }}
              className="flex flex-col gap-5"
              aria-live="polite"
            >
              <span className="text-xs font-medium tracking-widest text-paper/60 uppercase">
                {String(e + 1).padStart(2, "0")} · {entry.label}
              </span>
              <span className="text-paper/60">{entry.date}</span>
              <p className="text-2xl md:text-3xl">{entry.body}</p>
            </motion.div>
          </AnimatePresence>

          {/* Tap zones */}
          <button
            type="button"
            aria-label="Previous"
            onPointerDown={onDown}
            onPointerUp={() => onUp("left")}
            className="absolute inset-y-0 left-0 w-1/3 cursor-w-resize"
          />
          <button
            type="button"
            aria-label="Next"
            onPointerDown={onDown}
            onPointerUp={() => onUp("right")}
            className="absolute inset-y-0 right-0 w-2/3 cursor-e-resize"
          />
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <Link href={`/projects/${project.slug}`} transitionTypes={["nav-forward"]} onClick={onClose} className={buttonClass("primary", undefined, true)}>
            Read the full diary
          </Link>
          <span className="text-sm text-paper/60">
            {p + 1} of {projects.length} · {project.kind}
          </span>
        </div>
      </div>
    </motion.div>,
    document.body,
  );
}
