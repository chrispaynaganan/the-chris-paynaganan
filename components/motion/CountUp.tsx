"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/**
 * Counts a stat like "6 days" up from 0 when it scrolls into view.
 * The real number is rendered first (no JS, screen readers and reduced motion all get it),
 * and the animation writes straight to the DOM so React doesn't re-render every frame.
 */
export function CountUp({ value }: { value: string }) {
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? Number(match[1]) : null;
  const suffix = match ? match[2] : "";
  const numRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(numRef, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();

  // Start from 0 before the first paint, so the count-up never flashes the final number first
  useLayoutEffect(() => {
    if (!reduce && target !== null && numRef.current) numRef.current.textContent = "0";
  }, [reduce, target]);

  useEffect(() => {
    const el = numRef.current;
    if (!inView || reduce || target === null || !el) return;
    const controls = animate(0, target, {
      duration: 1.1,
      ease: [0.2, 0.7, 0.2, 1],
      onUpdate: (v) => {
        el.textContent = String(Math.round(v));
      },
    });
    return () => {
      controls.stop();
      el.textContent = String(target);
    };
  }, [inView, reduce, target]);

  if (target === null) return <span>{value}</span>;
  return (
    <span className="tabular-nums">
      <span className="sr-only">{value}</span>
      <span aria-hidden>
        <span ref={numRef}>{target}</span>
        {suffix}
      </span>
    </span>
  );
}
