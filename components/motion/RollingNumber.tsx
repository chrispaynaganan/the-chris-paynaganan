"use client";

import { useReducedMotion } from "motion/react";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * A price like "$1,585" where each digit rolls to its new value, like a departures board.
 * Digit columns line up from the right, so "$990" → "$1,270" rolls the digits it shares.
 */
export function RollingNumber({ value, className }: { value: string; className?: string }) {
  const reduce = useReducedMotion();
  const chars = value.split("");
  return (
    <span className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden className="inline-flex leading-none">
        {chars.map((ch, i) => {
          const fromRight = chars.length - i;
          if (!/\d/.test(ch)) {
            return (
              <span key={`s-${fromRight}`} className="inline-block h-lh">
                {ch}
              </span>
            );
          }
          return (
            <span key={`d-${fromRight}`} className="inline-block h-lh overflow-hidden">
              <span
                className="flex flex-col transition-transform duration-700 ease-soft"
                style={{ transform: `translateY(-${Number(ch) * 10}%)`, transitionDelay: reduce ? "0ms" : `${fromRight * 40}ms` }}
              >
                {DIGITS.map((d) => (
                  <span key={d} className="h-lh">
                    {d}
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
