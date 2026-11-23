"use client";

import Link from "next/link";
import { useEffect, useRef, useState, ViewTransition } from "react";
import { useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Share } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Project } from "@/types/content";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Shot } from "@/components/project/Shot";
import { ShareDialog } from "@/components/project/ShareDialog";

const SITE = "https://www.chrispaynaganan.com";

const PREVIEW_MS = 1500;

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [slide, setSlide] = useState(0);
  const [previewing, setPreviewing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const reduce = useReducedMotion();
  const count = project.screenshots.length;
  const go = (d: number) => setSlide((s) => (s + d + count) % count);
  const href = `/projects/${project.slug}`;
  const hoverDelay = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hover preview: after a short pause on the card, its screenshots cross-fade through on their own
  useEffect(() => {
    if (!previewing || reduce || count < 2) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % count), PREVIEW_MS);
    return () => clearInterval(t);
  }, [previewing, reduce, count]);

  const startPreview = () => {
    hoverDelay.current = setTimeout(() => setPreviewing(true), 450);
  };
  const stopPreview = () => {
    if (hoverDelay.current) clearTimeout(hoverDelay.current);
    setPreviewing(false);
  };
  useEffect(() => () => {
    if (hoverDelay.current) clearTimeout(hoverDelay.current);
  }, []);

  return (
    <article className="group relative flex flex-col" data-index={index} onMouseEnter={startPreview} onMouseLeave={stopPreview}>
      <div className="relative aspect-20/19 overflow-hidden rounded-card bg-placeholder">
        {/* Same name as the hero on the project page, so this thumbnail morphs into it */}
        <ViewTransition name={`shot-${project.slug}`} share="morph" default="none">
          <div className="relative h-full overflow-hidden">
            <div className="relative h-full transition-transform duration-700 ease-soft group-hover:scale-103">
              {project.screenshots.map((s, i) => (
                <Shot
                  key={s.label}
                  shot={s}
                  name={project.name}
                  alt={i % 2 === 1}
                  // the first screenshot of the first row is on screen when the page opens
                  eager={i === 0 && index < 4}
                  highPriority={i === 0 && index === 0}
                  className={cn("absolute inset-0 transition-opacity duration-700 ease-soft", i === slide ? "opacity-100" : "opacity-0")}
                />
              ))}
            </div>
          </div>
        </ViewTransition>
        <Link href={href} transitionTypes={["nav-forward"]} className="absolute inset-0" tabIndex={-1} aria-hidden />
        <StatusBadge status={project.status} className="absolute top-3 left-3" />
        {/* Share, where a travel site puts its heart: one tap to pass the project on */}
        <button
          type="button"
          onClick={() => setSharing(true)}
          aria-label={`Share ${project.name}`}
          className="group/share absolute top-2 right-2 flex size-11 cursor-pointer items-center justify-center"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-paper/90 shadow-float transition group-hover/share:scale-106 group-hover/share:bg-paper group-active/share:scale-94">
            <Share aria-hidden className="size-4" />
          </span>
        </button>
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous screenshot"
              className="absolute top-1/2 left-2.5 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-paper opacity-0 shadow-float transition group-hover:opacity-100 hover:scale-106 focus-visible:opacity-100"
            >
              <ChevronLeft aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next screenshot"
              className="absolute top-1/2 right-2.5 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-paper opacity-0 shadow-float transition group-hover:opacity-100 hover:scale-106 focus-visible:opacity-100"
            >
              <ChevronRight aria-hidden className="size-4" />
            </button>
            <div className="pointer-events-none absolute inset-x-0 bottom-2.5 flex justify-center gap-1.5">
              {project.screenshots.map((s, i) => (
                <span
                  key={s.label}
                  className={cn("h-1.5 rounded-full transition-all duration-500 ease-soft", i === slide ? "w-4 bg-ink" : "w-1.5 bg-ink/25")}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <Link href={href} transitionTypes={["nav-forward"]} className="flex flex-col gap-0.5 pt-3">
        <span className="flex justify-between gap-2">
          <span className="font-medium decoration-transparent underline-offset-4 transition group-hover:underline group-hover:decoration-ink">{project.name}</span>
          <span className="text-sm">{project.years}</span>
        </span>
        <span className="text-muted">{project.kind}</span>
        <span className="text-muted">{project.roleShort}</span>
      </Link>
      <ShareDialog
        open={sharing}
        onClose={() => setSharing(false)}
        url={`${SITE}/projects/${project.slug}`}
        title={project.name}
        subtitle={`${project.kind} · ${project.years}`}
      />
    </article>
  );
}
