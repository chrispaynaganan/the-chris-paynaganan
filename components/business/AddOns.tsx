"use client";

import { useState } from "react";
import { SegmentedControl } from "glisse";
import { Reveal } from "@/components/motion/Reveal";
import type { SiteContent } from "@/types/content";

type AddOn = SiteContent["business"]["addons"][number];
type Line = "business" | "personal";

/** À la carte extras for the chosen line, followed by the ones that apply to everyone. */
export function AddOns({ addons }: { addons: AddOn[] }) {
  const [line, setLine] = useState<Line>("business");
  const forLine = addons.filter((a) => a.group === line);
  const shared = addons.filter((a) => !a.group || a.group === "all");

  const list = (items: AddOn[]) => (
    <ul className="grid gap-x-16 gap-y-8 lg:grid-cols-2">
      {items.map((a, i) => (
        <li key={`${a.group}-${a.name}`}>
          <Reveal delay={(i % 2) * 0.08} y={12} className="group flex flex-col gap-1.5">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl">{a.name}</span>
              <span aria-hidden className="mb-1.5 flex-1 border-b border-dotted border-paper/30 transition group-hover:border-paper/70" />
              <span className="font-medium">{a.php}</span>
            </div>
            <div className="flex justify-between gap-4 text-sm text-paper/55">
              <span>{a.description}</span>
              <span className="shrink-0">{a.usd}</span>
            </div>
          </Reveal>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="flex flex-col gap-10">
      <SegmentedControl
        aria-label="Which add-ons to show"
        className="self-start"
        items={[
          { value: "business", label: "For business" },
          { value: "personal", label: "For personal" },
        ]}
        value={line}
        onValueChange={(v) => setLine(v as Line)}
      />
      {forLine.length > 0 && list(forLine)}
      {shared.length > 0 && (
        <div className="flex flex-col gap-8">
          <span className="text-xs font-medium tracking-widest text-paper/60 uppercase">For everyone</span>
          {list(shared)}
        </div>
      )}
    </div>
  );
}
