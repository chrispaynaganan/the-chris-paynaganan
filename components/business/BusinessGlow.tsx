"use client";

import { useReducedMotion } from "motion/react";
import GlowCursor from "@/components/reactbits/GlowCursor";

/**
 * The glowing cursor trail behind the Chris for Business page.
 * It sits behind the content and stays in the viewport (sticky) while you scroll
 * the page, and stops where the page ends. Off for visitors who prefer reduced motion.
 */
export function BusinessGlow() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <div className="sticky top-0 h-screen">
        <GlowCursor
          color="#ffffff"
          secondaryColor="#a3a3a3"
          intensity={0.9}
          glow={1}
          trailWidth={3}
          linger={1.2}
          hotspot={0.6}
          quality="medium"
          theme="dark"
        />
      </div>
    </div>
  );
}
