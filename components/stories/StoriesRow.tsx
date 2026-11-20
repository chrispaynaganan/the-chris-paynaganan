"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { StoryViewer } from "./StoryViewer";
import type { StoryProject } from "./types";

/** A row of story rings on the home page. Rings turn grey once watched (this visit). */
export function StoriesRow({ projects }: { projects: StoryProject[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const [seen, setSeen] = useState<string[]>([]);
  return (
    <section aria-labelledby="stories-title" className="flex flex-col gap-3">
      <h2 id="stories-title" className="text-sm font-medium text-muted">
        30-second stories
      </h2>
      <ul className="flex gap-5 overflow-x-auto pb-1">
        {projects.map((p, i) => {
          const watched = seen.includes(p.slug);
          return (
            <li key={p.slug}>
              <motion.button
                type="button"
                onClick={() => setOpen(i)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 24, delay: 0.1 + i * 0.06 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.94 }}
                className="flex w-20 cursor-pointer flex-col items-center gap-2"
                aria-label={`Watch the ${p.name} story`}
              >
                <span className={cn("rounded-full p-0.5 transition", watched ? "border border-line-strong" : "border-2 border-ink")}>
                  <span className="flex size-16 items-center justify-center rounded-full border-2 border-paper bg-placeholder text-sm font-medium">
                    {p.name.slice(0, 2).toUpperCase()}
                  </span>
                </span>
                <span className="w-full truncate text-xs">{p.name}</span>
              </motion.button>
            </li>
          );
        })}
      </ul>
      <AnimatePresence>
        {open !== null && (
          <StoryViewer
            projects={projects}
            start={open}
            onClose={() => setOpen(null)}
            onSeen={(slug) => setSeen((s) => (s.includes(slug) ? s : [...s, slug]))}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
