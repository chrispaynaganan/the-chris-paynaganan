"use client";

import { motion, useReducedMotion } from "motion/react";
import type { PassportStamp } from "@/types/content";
import { StampMark } from "./StampMark";

/**
 * A stamp pressed onto a page: it drops in, a soft ink halo bleeds out around it,
 * and a ring ripples away. With `still`, it's drawn already pressed (used mid page-turn).
 */
export function PressedStamp({ stamp, tilt, delay = 0, still = false }: { stamp: PassportStamp; tilt: number; delay?: number; still?: boolean }) {
  const reduce = useReducedMotion();
  const calm = still || reduce;
  return (
    <div className="relative w-full" style={{ rotate: `${stamp.earned ? tilt : 0}deg` }}>
      {stamp.earned && (
        <>
          {/* Ink bleed: a blurred copy that spreads, then settles faintly */}
          <motion.div
            aria-hidden
            className="absolute inset-0 mix-blend-multiply"
            initial={calm ? { opacity: 0.1, scale: 1.03, filter: "blur(2px)" } : { opacity: 0, scale: 0.9, filter: "blur(0px)" }}
            animate={{ opacity: [null, 0.35, 0.1], scale: [null, 1.08, 1.03], filter: ["blur(0px)", "blur(4px)", "blur(2px)"] }}
            transition={calm ? { duration: 0 } : { duration: 0.9, delay: delay + 0.15, ease: "easeOut" }}
          >
            <StampMark stamp={stamp} decorative />
          </motion.div>
          {!calm && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full border-2 border-ink"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: [0, 0.3, 0], scale: [0.85, 1.05, 1.35] }}
              transition={{ duration: 0.7, ease: "easeOut", delay: delay + 0.12 }}
            />
          )}
        </>
      )}
      <motion.div
        className="relative mix-blend-multiply"
        initial={calm ? false : { opacity: 0, scale: 1.6, y: -10 }}
        animate={{ opacity: stamp.earned ? 0.92 : 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 520, damping: 22, delay }}
      >
        <StampMark stamp={stamp} />
      </motion.div>
    </div>
  );
}
