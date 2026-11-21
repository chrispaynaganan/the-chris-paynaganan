"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { categories } from "@/lib/categories";
import { categoryIcons } from "./categoryIcons";
import { useSearchDock } from "./SearchDock";

const ease = [0.2, 0.7, 0.2, 1] as const;

/** The panel under the search bar: suggested searches and projects to jump to. */
export function SearchSuggestions({ id, onDone }: { id: string; onDone: () => void }) {
  const { projects, query, setQuery, setCat, setLiveOnly } = useSearchDock();
  const q = query.trim().toLowerCase();
  const cats = categories.filter((c) => c.id !== "all" && (!q || c.label.toLowerCase().includes(q)));
  const matches = projects.filter((p) => !q || `${p.name} ${p.kind} ${p.category} ${p.platform}`.toLowerCase().includes(q));

  return (
    <motion.div
      id={id}
      role="region"
      aria-label="Search suggestions"
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.22, ease }}
      style={{ transformOrigin: "top center" }}
      className="w-full rounded-panel border border-line bg-paper p-6 shadow-float"
    >
      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <span className="text-xs font-medium text-muted">Suggested searches</span>
          <div className="flex flex-wrap gap-2">
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease }}
              onClick={() => {
                setLiveOnly(true);
                setCat("all");
                setQuery("");
                onDone();
              }}
              className="flex h-9 cursor-pointer items-center gap-2 rounded-full border border-line-strong px-3.5 text-sm transition hover:border-ink"
            >
              <BadgeCheck aria-hidden className="size-4 text-ok" /> Live projects
            </motion.button>
            {cats.map((c, i) => {
              const Icon = categoryIcons[c.id];
              return (
                <motion.button
                  key={c.id}
                  type="button"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease, delay: 0.03 * (i + 1) }}
                  onClick={() => {
                    setCat(c.id);
                    setQuery("");
                    onDone();
                  }}
                  className="flex h-9 cursor-pointer items-center gap-2 rounded-full border border-line-strong px-3.5 text-sm transition hover:border-ink"
                >
                  {Icon && <Icon aria-hidden className="size-4" />} {c.label}
                </motion.button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted">{q ? "Matching projects" : "Jump to a project"}</span>
          {matches.length === 0 && <span className="py-2 text-sm text-muted">No projects match “{query}”.</span>}
          <ul className="flex flex-col">
            {matches.map((p, i) => (
              <motion.li key={p.slug} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, ease, delay: 0.04 * i }}>
                <Link
                  href={`/projects/${p.slug}`}
                  transitionTypes={["nav-forward"]}
                  onClick={onDone}
                  className="group flex items-center gap-3 rounded-xl p-2 transition hover:bg-surface"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-placeholder text-sm font-medium">
                    {p.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{p.name}</span>
                    <span className="truncate text-sm text-muted">{p.kind}</span>
                  </span>
                  <ArrowUpRight aria-hidden className="size-4 text-muted transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink" />
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
