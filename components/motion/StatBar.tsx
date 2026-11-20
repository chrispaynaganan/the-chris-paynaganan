"use client";

import { motion, useReducedMotion } from "motion/react";

/** A thin bar that fills as the stat scrolls into view. Decorative. */
export function StatBar({ delay = 0 }: { delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <span aria-hidden className="block h-1 w-full overflow-hidden rounded-full bg-line">
      <motion.span
        className="block h-full origin-left rounded-full bg-ink"
        initial={reduce ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1], delay }}
      />
    </span>
  );
}
