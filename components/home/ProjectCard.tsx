"use client";

import Link from "next/link";
import { useState, ViewTransition } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Project } from "@/types/content";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useSaved } from "@/components/ui/SavedProvider";
import { useToast } from "@/components/ui/Toast";
import { Shot } from "@/components/project/Shot";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [slide, setSlide] = useState(0);
  const { saved, toggle } = useSaved();
  const toast = useToast();
  const isSaved = saved.includes(project.slug);
  const count = project.screenshots.length;
  const go = (d: number) => setSlide((s) => (s + d + count) % count);
  const href = `/projects/${project.slug}`;

  return (
    <article className="group relative flex flex-col" data-index={index}>
      <div className="relative aspect-20/19 overflow-hidden rounded-2xl bg-placeholder">
        {/* Same name as the hero on the project page, so this thumbnail morphs into it */}
        <ViewTransition name={`shot-${project.slug}`} share="morph" default="none">
          <div className="h-full overflow-hidden">
            <div
              className="flex h-full transition-transform duration-500 ease-soft group-hover:scale-103"
              style={{ transform: `translateX(-${slide * 100}%)` }}
            >
              {project.screenshots.map((s, i) => (
                <Shot key={s.label} shot={s} name={project.name} alt={i % 2 === 1} className="h-full w-full shrink-0" />
              ))}
            </div>
          </div>
        </ViewTransition>
        <Link href={href} transitionTypes={["nav-forward"]} className="absolute inset-0" tabIndex={-1} aria-hidden />
        <StatusBadge status={project.status} className="absolute top-3 left-3" />
        <button
          type="button"
          onClick={() => {
            const nowSaved = toggle(project.slug);
            toast("ok", nowSaved ? `Saved ${project.name}` : "Removed from saved");
          }}
          aria-pressed={isSaved}
          aria-label={isSaved ? `Remove ${project.name} from saved` : `Save ${project.name}`}
          className="absolute top-2 right-2 flex size-11 cursor-pointer items-center justify-center transition active:scale-85"
        >
          <Heart
            aria-hidden
            className={cn("size-6.5 stroke-paper stroke-2", isSaved ? "animate-heart fill-ink" : "fill-ink/35")}
          />
        </button>
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous screenshot"
              className="absolute top-1/2 left-2.5 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-paper opacity-0 shadow-arrow transition group-hover:opacity-100 hover:scale-106 focus-visible:opacity-100"
            >
              <ChevronLeft aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next screenshot"
              className="absolute top-1/2 right-2.5 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-paper opacity-0 shadow-arrow transition group-hover:opacity-100 hover:scale-106 focus-visible:opacity-100"
            >
              <ChevronRight aria-hidden className="size-4" />
            </button>
            <div className="pointer-events-none absolute inset-x-0 bottom-2.5 flex justify-center gap-1.5">
              {project.screenshots.map((s, i) => (
                <span key={s.label} className={cn("size-1.5 rounded-full transition", i === slide ? "bg-ink" : "bg-ink/25")} />
              ))}
            </div>
          </>
        )}
      </div>
      <Link href={href} transitionTypes={["nav-forward"]} className="flex flex-col gap-0.5 pt-3">
        <span className="flex justify-between gap-2">
          <span className="font-medium underline-offset-4 decoration-transparent transition group-hover:underline group-hover:decoration-ink">{project.name}</span>
          <span className="text-sm">{project.years}</span>
        </span>
        <span className="text-muted">{project.kind}</span>
        <span className="text-muted">{project.roleShort}</span>
      </Link>
    </article>
  );
}
