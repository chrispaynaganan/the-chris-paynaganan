"use client";

import { motion, useReducedMotion } from "motion/react";
import { buttonClass } from "@/components/ui/button";

/** Phones: a bottom bar like a booking app's, pointing to the "Explore the work" card. */
export function MobileWorkBar({ years, status }: { years: string; status: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { y: "110%" }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.4 }}
      style={{ viewTransitionName: "tab-bar" }}
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-line bg-paper px-6 py-3 md:hidden"
    >
      <span className="flex flex-col">
        <span className="text-sm font-medium">{years}</span>
        <span className="text-xs text-muted">{status}</span>
      </span>
      <a href="#explore" className={buttonClass("primary")}>
        Explore the work
      </a>
    </motion.div>
  );
}
