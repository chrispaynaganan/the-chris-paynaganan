"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export function Faq({ items, dark = false }: { items: { q: string; a: string }[]; dark?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="flex flex-col">
      {items.map((f, i) => {
        const on = open === i;
        return (
          <div key={f.q} className={cn("border-b", dark ? "border-paper/15" : "border-line")}>
            <h3>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`faq-${i}`}
                onClick={() => setOpen(on ? null : i)}
                className="flex min-h-16 w-full cursor-pointer items-center justify-between gap-4 py-4 text-left text-lg font-semibold"
              >
                {f.q}
                <ChevronDown aria-hidden className={cn("size-4 shrink-0 stroke-3 transition duration-300", on && "rotate-180")} />
              </button>
            </h3>
            <div id={`faq-${i}`} hidden={!on} className={cn("max-w-3xl animate-fade-in pb-6", dark ? "text-paper/70" : "text-body")}>
              {f.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
