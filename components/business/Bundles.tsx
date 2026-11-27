"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { SegmentedControl } from "glisse";
import { cn } from "@/lib/cn";
import { buttonClass } from "@/components/ui/button";
import { RollingNumber } from "@/components/motion/RollingNumber";
import PixelCard from "@/components/reactbits/PixelCard";
import type { Bundle } from "@/types/content";

const numerals = ["I", "II", "III", "IV", "V"];

type Line = "business" | "personal";

/**
 * The bundle cards, with a For business | For personal switch so every bundle is one tap away,
 * and the "What's inside" table under them: the value of each phase, the bundle price and the saving.
 */
export function Bundles({
  business,
  personal,
  notes,
  initial = "business",
}: {
  business: Bundle[];
  personal: Bundle[];
  notes: { personal: string; business: string };
  initial?: Line;
}) {
  const [line, setLine] = useState<Line>(initial);
  const bundles = line === "business" ? business : personal;
  const phases = bundles[0]?.breakdown?.map((p) => p.phase) ?? [];

  const choose = (name: string) => {
    window.dispatchEvent(new CustomEvent("choose-bundle", { detail: name }));
    document.getElementById("inquire")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-8">
      <SegmentedControl
        aria-label="Which bundles to show"
        className="self-start"
        items={[
          { value: "business", label: "For business" },
          { value: "personal", label: "For personal" },
        ]}
        value={line}
        onValueChange={(v) => setLine(v as Line)}
      />
      <div className="grid gap-5 lg:grid-cols-3">
        {bundles.map((b, i) => {
          const lit = !!b.popular;
          return (
            <motion.article
              // Keyed by position so switching lines rolls the prices instead of remounting the cards
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1], delay: i * 0.12 }}
              className="h-full transition duration-500 ease-soft hover:-translate-y-1.5"
            >
              {/* React Bits PixelCard: pixels frame the card (faded toward the middle so the text stays clear) */}
              <PixelCard
                theme={lit ? "light" : "dark"}
                colors={lit ? ["#000000", "#404040", "#a3a3a3"] : ["#ffffff", "#f5f5f5", "#d4d4d4"]}
                glowColor={lit ? "#737373" : "#d4d4d4"}
                shape="square"
                origin="center"
                gap={5}
                pixelSize={2}
                speed={35}
                revealDuration={600}
                spotlight={0.5}
                glow={0.5}
                opacity={0.35}
                fade={0.7}
                trigger="hover"
                clickPulse
                intro
                introDelay={i * 180}
                noFocus
              >
                <div className={cn("flex h-full flex-col gap-7 p-8", lit ? "text-ink" : "text-paper")}>
                  <div className="flex items-start justify-between gap-3">
                    <span className={cn("text-5xl", lit ? "text-ink/25" : "text-paper/25")}>{numerals[i]}</span>
                    {lit && <span className="rounded-full border border-ink px-3 py-1 text-xs font-medium tracking-widest uppercase">Recommended</span>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-3xl">{b.name}</h3>
                    {b.bestFor && <p className={cn("text-sm", lit ? "text-muted" : "text-paper/60")}>{b.bestFor}</p>}
                    <div className="flex flex-wrap items-baseline gap-x-2 pt-3">
                      <RollingNumber value={b.payInFull.php} className="text-5xl font-semibold tracking-tighter" />
                      <RollingNumber value={b.payInFull.usd} className={cn("text-sm", lit ? "text-muted" : "text-paper/60")} />
                    </div>
                    <span className={cn("text-xs font-medium tracking-widest uppercase", lit ? "text-muted" : "text-paper/50")}>
                      {b.timeline ? `${b.timeline} · paid by milestone` : "Paid by milestone"}
                    </span>
                    {(b.valuedAt || b.save) && (
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        {b.valuedAt && <span className={cn("line-through", lit ? "text-muted" : "text-paper/50")}>Valued at {b.valuedAt}</span>}
                        {b.save && <span className="rounded-full bg-ok-bg px-2.5 py-1 font-medium text-ok">{b.save}</span>}
                      </div>
                    )}
                  </div>
                  <span aria-hidden className={cn("h-px w-full", lit ? "bg-ink/15" : "bg-paper/15")} />
                  <div className="flex flex-1 flex-col gap-3">
                    {b.lead && <p className={cn("text-sm font-medium", lit ? "text-ink" : "text-paper")}>{b.lead}</p>}
                    <ul className="flex flex-col gap-3">
                      {b.items.map((it) => (
                        <li key={it} className={cn("flex items-start gap-3 text-sm", lit ? "text-ink" : "text-paper/85")}>
                          <Check aria-hidden className="mt-0.5 size-3.5 shrink-0 stroke-3" /> {it}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button type="button" onClick={() => choose(b.name)} className={buttonClass(lit ? "primary" : "secondary", "w-full", !lit)}>
                    Start with {b.name}
                  </button>
                </div>
              </PixelCard>
            </motion.article>
          );
        })}
      </div>

      <p className="text-sm text-paper/60">{line === "business" ? notes.business : notes.personal}</p>

      {phases.length > 0 && (
        <div className="flex flex-col gap-4 pt-8">
          <h3 className="text-2xl">What’s inside each bundle</h3>
          <p className="max-w-3xl text-paper/70">
            Every part of a project is priced by the hours it takes, at one rate. A bundle costs less than its parts because each step
            feeds the next, with no hand-offs and no repeated work.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-xl border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-paper/30">
                  <th scope="col" className="py-3 pr-4 font-medium text-paper/60">Phase</th>
                  {bundles.map((b) => (
                    <th key={b.name} scope="col" className="py-3 pr-4 text-right font-medium">{b.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {phases.map((phase, r) => (
                  <tr key={phase} className="border-b border-paper/10">
                    <th scope="row" className="py-3 pr-4 font-normal text-paper/70">{phase}</th>
                    {bundles.map((b) => (
                      <td key={b.name} className="py-3 pr-4 text-right tabular-nums text-paper/85">{b.breakdown?.[r]?.php ?? "—"}</td>
                    ))}
                  </tr>
                ))}
                <tr className="border-b border-paper/10">
                  <th scope="row" className="py-3 pr-4 font-medium">Valued at</th>
                  {bundles.map((b) => (
                    <td key={b.name} className="py-3 pr-4 text-right font-medium tabular-nums">{b.valuedAt ?? "—"}</td>
                  ))}
                </tr>
                <tr className="border-b border-paper/10">
                  <th scope="row" className="py-3 pr-4 font-medium">Your price</th>
                  {bundles.map((b) => (
                    <td key={b.name} className="py-3 pr-4 text-right font-semibold tabular-nums">{b.payInFull.php}</td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="py-3 pr-4 font-normal text-paper/70">You save</th>
                  {bundles.map((b) => (
                    <td key={b.name} className="py-3 pr-4 text-right tabular-nums text-paper/85">{b.save?.replace(/^Save\s*/, "") ?? "—"}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
