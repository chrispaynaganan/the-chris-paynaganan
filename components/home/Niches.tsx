"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { PassportStamp } from "@/types/content";
import { StampMark } from "@/components/stamps/StampMark";
import { useSearchDock } from "./SearchDock";

const tilts = [-6, 4, -3, 5, -4, 3, -2, 6, -5, 2];
const ease = [0.2, 0.7, 0.2, 1] as const;

/**
 * "Niches I’ve explored": one tile per area of work, with its stamp as the illustration.
 * Earned niches filter the projects above; open ones invite a project in that area.
 */
export function Niches({ stamps }: { stamps: PassportStamp[] }) {
  const { setNiche, setCat, setQuery, setLiveOnly } = useSearchDock();
  const reduce = useReducedMotion();

  const pick = (id: string, label: string) => {
    setCat("all");
    setQuery("");
    setLiveOnly(false);
    setNiche({ id, label });
    document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="niches" aria-labelledby="niches-title" className="flex scroll-mt-20 flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h2 id="niches-title" className="text-2xl font-semibold tracking-tight">
          Niches I’ve explored
        </h2>
        <p className="text-body">Every area I’ve designed or built in, stamped. Pick one to see the work.</p>
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {stamps.map((s, i) => {
          const tilt = tilts[i % tilts.length];
          const tile = (
            <>
              <span className="flex aspect-square items-center justify-center rounded-card bg-surface transition duration-300 group-hover:bg-placeholder">
                <motion.span
                  className="w-3/5 mix-blend-multiply"
                  initial={reduce ? { rotate: s.earned ? tilt : 0 } : { opacity: 0, scale: 1.5, rotate: tilt - 12 }}
                  whileInView={{ opacity: s.earned ? 0.92 : 1, scale: 1, rotate: s.earned ? tilt : 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ type: "spring", stiffness: 420, damping: 20, delay: reduce ? 0 : (i % 6) * 0.06 }}
                  whileHover={s.earned && !reduce ? { rotate: 0, scale: 1.06 } : undefined}
                >
                  <StampMark stamp={s} />
                </motion.span>
              </span>
              <span className="flex flex-col gap-0.5 pt-2.5 text-left">
                <span className="text-sm font-medium">{s.label}</span>
                <span className="text-sm text-muted">
                  {s.earned ? `${s.projects.length} ${s.projects.length === 1 ? "project" : "projects"} · since ${s.year}` : "Next stop · got one?"}
                </span>
              </span>
            </>
          );
          return (
            <motion.li key={s.id} initial={reduce ? false : { opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, ease, delay: (i % 6) * 0.05 }}>
              {s.earned ? (
                <button type="button" onClick={() => pick(s.id, s.label)} className="group flex w-full cursor-pointer flex-col" aria-label={`Show my ${s.label} projects`}>
                  {tile}
                </button>
              ) : (
                <Link href="/business#inquire" className="group flex flex-col" aria-label={`${s.label}: not explored yet. Start a project`}>
                  {tile}
                </Link>
              )}
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
