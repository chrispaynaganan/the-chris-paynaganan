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

export function Bundles({ bundles }: { bundles: Bundle[] }) {
  const [full, setFull] = useState(true);

  const choose = (name: string) => {
    window.dispatchEvent(new CustomEvent("choose-bundle", { detail: name }));
    document.getElementById("inquire")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-8">
      <SegmentedControl
        aria-label="Payment option"
        className="self-start"
        items={[
          { value: "full", label: "Pay in full" },
          { value: "installments", label: "Installments" },
        ]}
        value={full ? "full" : "installments"}
        onValueChange={(v) => setFull(v === "full")}
      />
      <div className="grid gap-5 lg:grid-cols-3">
        {bundles.map((b, i) => {
          const price = full ? b.payInFull : b.installments;
          const lit = !!b.popular;
          return (
            <motion.article
              key={b.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1], delay: i * 0.12 }}
              className="h-full transition duration-500 ease-soft hover:-translate-y-1.5"
            >
              {/* Pixels twinkle in from the pointer on hover: white on the black cards, black on the white one */}
              <PixelCard
                theme={lit ? "light" : "dark"}
                colors={lit ? ["#000000", "#404040", "#a3a3a3"] : ["#ffffff", "#e5e5e5", "#a3a3a3"]}
                glowColor={lit ? "#737373" : "#d4d4d4"}
                gap={lit ? 6 : 5}
                speed={30}
                origin="pointer"
                introDelay={i * 180}
                noFocus
              >
                <div className={cn("flex h-full flex-col gap-7 p-8", lit ? "text-ink" : "text-paper")}>
                  <div className="flex items-start justify-between gap-3">
                    <span className={cn("text-5xl", lit ? "text-ink/25" : "text-paper/25")}>{numerals[i]}</span>
                    {lit && <span className="rounded-full border border-ink px-3 py-1 text-xs font-medium tracking-widest uppercase">Most chosen</span>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-3xl">{b.name}</h3>
                    <div className="flex items-baseline gap-2 pt-3">
                      <RollingNumber value={price.usd} className="text-5xl font-semibold tracking-tighter" />
                      <RollingNumber value={price.php} className={cn("text-sm", lit ? "text-muted" : "text-paper/60")} />
                    </div>
                    <span className={cn("text-xs font-medium tracking-widest uppercase", lit ? "text-muted" : "text-paper/50")}>
                      {full ? "Paid in full · per project" : "From, in installments"}
                    </span>
                    {b.save && full && <span className="mt-3 self-start rounded-full bg-ok-bg px-2.5 py-1 text-xs font-medium text-ok">{b.save}</span>}
                  </div>
                  <span aria-hidden className={cn("h-px w-full", lit ? "bg-ink/15" : "bg-paper/15")} />
                  <ul className="flex flex-1 flex-col gap-3">
                    {b.items.map((it) => (
                      <li key={it} className={cn("flex items-start gap-3 text-sm", lit ? "text-ink" : "text-paper/85")}>
                        <Check aria-hidden className="mt-0.5 size-3.5 shrink-0 stroke-3" /> {it}
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={() => choose(b.name)} className={buttonClass(lit ? "primary" : "secondary", "w-full", !lit)}>
                    Choose {b.name}
                  </button>
                </div>
              </PixelCard>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
