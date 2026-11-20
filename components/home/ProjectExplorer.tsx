"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Switch } from "glisse";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Project } from "@/types/content";
import { Notice } from "@/components/ui/Notice";
import { useSearchDock } from "./SearchDock";
import { ProjectCard } from "./ProjectCard";

const ease = [0.2, 0.7, 0.2, 1] as const;

export function ProjectExplorer({
  projects,
  categories,
}: {
  projects: Project[];
  categories: readonly { id: string; label: string }[];
}) {
  const [cat, setCat] = useState("all");
  const [liveOnly, setLiveOnly] = useState(false);
  const { query, setQuery, setDocked, inputRef } = useSearchDock();
  const pillRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const q = query.trim().toLowerCase();

  // When the big pill scrolls under the header, the compact one slides into the header
  useEffect(() => {
    const el = pillRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setDocked(!entry.isIntersecting), { rootMargin: "-80px 0px 0px 0px" });
    io.observe(el);
    return () => {
      io.disconnect();
      setDocked(false);
    };
  }, [setDocked]);

  const shown = useMemo(
    () =>
      projects.filter((p) => {
        const inCat = cat === "all" || p.tags.includes(cat);
        const hay = `${p.name} ${p.kind} ${p.category} ${p.platform}`.toLowerCase();
        return inCat && (!liveOnly || p.status === "live") && (!q || hay.includes(q));
      }),
    [projects, cat, q, liveOnly],
  );
  const showBiz = cat === "all" && !q && !liveOnly;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-5">
        <motion.div
          ref={pillRef}
          initial={reduce ? false : { opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease }}
          className="group/pill flex w-full max-w-3xl items-center rounded-full border border-line-strong py-2 pr-2 pl-6 shadow-pill transition-shadow duration-300 focus-within:shadow-pill-hover hover:shadow-pill-hover"
        >
          <div className="flex min-w-0 flex-1 flex-col pr-4">
            <label htmlFor="project-search" className="text-xs font-bold">
              Search the diary
            </label>
            <input
              ref={inputRef}
              id="project-search"
              type="text"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Project, industry or platform"
              className="min-w-0 bg-transparent pt-0.5 text-sm outline-none placeholder:text-muted"
            />
          </div>
          <AnimatePresence>
            {query && (
              <motion.button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                className="mr-2 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-placeholder transition hover:bg-placeholder-alt"
              >
                <X aria-hidden className="size-3.5 stroke-3" />
              </motion.button>
            )}
          </AnimatePresence>
          <div className="hidden flex-col border-l border-line px-4 md:flex">
            <span className="text-xs font-bold">Role</span>
            <span className="text-sm text-muted">Product designer</span>
          </div>
          <div className="hidden flex-col border-l border-line px-4 md:flex">
            <span className="text-xs font-bold">Years</span>
            <span className="text-sm text-muted">2023–2026</span>
          </div>
          <span aria-hidden className="flex h-12 min-w-12 shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-3.5 text-sm font-semibold text-paper transition-all duration-300 group-focus-within/pill:px-5">
            <Search className="size-4.5 stroke-3" />
            <span className="hidden group-focus-within/pill:inline">Search</span>
          </span>
        </motion.div>

        <div className="flex w-full items-center gap-6 border-t border-line">
          <div role="toolbar" aria-label="Filter by category" className="flex flex-1 justify-start gap-7 overflow-x-auto md:justify-center">
            {categories.map((c) => {
              const on = c.id === cat;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCat(c.id)}
                  aria-pressed={on}
                  className={cn(
                    "relative flex h-13 shrink-0 cursor-pointer items-center px-0.5 text-sm font-semibold transition-colors",
                    on ? "text-ink" : "text-ink/60 hover:text-ink",
                  )}
                >
                  {c.label}
                  {on && (
                    <motion.span
                      layoutId="category-underline"
                      className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-ink"
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <div className="hidden shrink-0 items-center gap-3 rounded-xl border border-line-strong py-2 pr-2 pl-4 lg:flex">
            <span id="live-only" className="text-sm font-semibold">Shipped only</span>
            <Switch aria-labelledby="live-only" checked={liveOnly} onCheckedChange={setLiveOnly} />
          </div>
        </div>
      </div>

      <motion.div layout className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((p, i) => (
            <motion.div
              key={p.slug}
              layout
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.35, ease }}
            >
              <ProjectCard project={p} index={i} />
            </motion.div>
          ))}
          {showBiz && (
            <motion.div
              key="business"
              layout
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.35, ease }}
            >
              <Link href="/business" className="group flex animate-fade-up flex-col" style={{ animationDelay: `${shown.length * 70}ms` }}>
                <div className="relative flex aspect-20/19 flex-col justify-between overflow-hidden rounded-2xl bg-ink p-6 text-paper">
                  <span className="self-start rounded border border-paper px-2 py-1 text-xs font-bold tracking-widest uppercase">Chris for Business</span>
                  <span className="text-2xl font-extrabold tracking-tight transition duration-500 ease-soft group-hover:-translate-y-1">
                    I build websites that make you money.
                  </span>
                  <span aria-hidden className="absolute -right-10 -bottom-10 size-40 rounded-full border border-paper/20 transition duration-700 ease-soft group-hover:scale-150" />
                </div>
                <span className="flex flex-col gap-0.5 pt-3">
                  <span className="font-bold">For clients</span>
                  <span className="text-muted">Bundles from $990 · design + build</span>
                </span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {shown.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Notice tone="info" role="status" className="max-w-xl">
              No entries match that yet. Try “healthcare”, “mobile” or “voice”.
            </Notice>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
