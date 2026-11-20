"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Project } from "@/types/content";
import { Notice } from "@/components/ui/Notice";
import { ProjectCard } from "./ProjectCard";

export function ProjectExplorer({
  projects,
  categories,
}: {
  projects: Project[];
  categories: readonly { id: string; label: string }[];
}) {
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const shown = useMemo(
    () =>
      projects.filter((p) => {
        const inCat = cat === "all" || p.tags.includes(cat);
        const hay = `${p.name} ${p.kind} ${p.category} ${p.platform}`.toLowerCase();
        return inCat && (!q || hay.includes(q));
      }),
    [projects, cat, q],
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-5">
        <div className="flex w-full max-w-3xl items-center rounded-full border border-line-strong py-2 pr-2 pl-6 shadow-pill transition hover:shadow-pill-hover">
          <div className="flex min-w-0 flex-1 flex-col pr-4">
            <label htmlFor="project-search" className="text-xs font-bold">
              Search the diary
            </label>
            <input
              id="project-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Project, industry or platform"
              className="min-w-0 bg-transparent pt-0.5 text-sm outline-none placeholder:text-muted"
            />
          </div>
          <div className="hidden flex-col border-l border-line px-4 md:flex">
            <span className="text-xs font-bold">Role</span>
            <span className="text-sm text-muted">Product designer</span>
          </div>
          <div className="hidden flex-col border-l border-line px-4 md:flex">
            <span className="text-xs font-bold">Years</span>
            <span className="text-sm text-muted">2023–2026</span>
          </div>
          <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-full bg-ink">
            <Search className="size-4.5 stroke-3 text-paper" />
          </span>
        </div>

        <div role="toolbar" aria-label="Filter by category" className="flex w-full justify-start gap-7 overflow-x-auto border-t border-line md:justify-center">
          {categories.map((c) => {
            const on = c.id === cat;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCat(c.id)}
                aria-pressed={on}
                className={cn(
                  "flex min-h-13 shrink-0 cursor-pointer items-center border-b-2 px-0.5 text-sm font-semibold transition",
                  on ? "border-ink text-ink" : "border-transparent text-ink/60 hover:border-line-strong hover:text-ink",
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={i} />
        ))}
        {cat === "all" && !q && (
          <Link href="/business" className="group flex animate-fade-up flex-col" style={{ animationDelay: `${shown.length * 60}ms` }}>
            <div className="flex aspect-20/19 flex-col justify-between rounded-2xl bg-ink p-6 text-paper transition duration-300 group-hover:scale-101">
              <span className="self-start rounded border border-paper px-2 py-1 text-xs font-bold tracking-widest uppercase">Chris for Business</span>
              <span className="text-2xl font-extrabold tracking-tight">I build websites that make you money.</span>
            </div>
            <span className="flex flex-col gap-0.5 pt-3">
              <span className="font-bold">For clients</span>
              <span className="text-muted">Bundles from $990 · design + build</span>
            </span>
          </Link>
        )}
      </div>

      {shown.length === 0 && (
        <Notice tone="info" role="status" className="max-w-xl">
          No entries match that yet. Try “healthcare”, “mobile” or “voice”.
        </Notice>
      )}
    </div>
  );
}
