"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { PassportStamp } from "@/types/content";
import { StampMark } from "./StampMark";

const tilts = [-7, 4, -3, 6, -5, 3, -2, 5, -4, 2];

/** A grid of stamps that thunk down onto the page as they scroll into view. */
export function Passport({ stamps, compact = false }: { stamps: PassportStamp[]; compact?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <ul className={compact ? "grid grid-cols-3 gap-4 sm:grid-cols-4" : "grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-5"}>
      {stamps.map((s, i) => {
        const tilt = tilts[i % tilts.length];
        return (
          <li key={s.id} className="flex flex-col items-center gap-3 text-center">
            <motion.div
              className="w-full max-w-40 mix-blend-multiply"
              initial={reduce ? { rotate: tilt } : { opacity: 0, scale: 1.7, rotate: tilt - 14 }}
              whileInView={{ opacity: s.earned ? 0.92 : 1, scale: 1, rotate: s.earned ? tilt : 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ type: "spring", stiffness: 420, damping: 20, delay: reduce ? 0 : (i % 5) * 0.08 }}
              whileHover={s.earned ? { scale: 1.06, rotate: 0 } : undefined}
            >
              <StampMark stamp={s} />
            </motion.div>
            {!compact && (
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold">{s.label}</span>
                {s.earned ? (
                  <span className="text-sm text-muted">
                    {s.projects.map((p, j) => (
                      <span key={p.slug}>
                        {j > 0 && ", "}
                        <Link href={`/projects/${p.slug}`} className="underline underline-offset-4 hover:text-ink">
                          {p.name}
                        </Link>
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="text-sm text-muted">Not stamped yet</span>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
