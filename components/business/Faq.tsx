"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="flex flex-col">
      {items.map((f, i) => {
        const on = open === i;
        return (
          <div key={f.q} className="border-b border-line">
            <h3>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`faq-${i}`}
                onClick={() => setOpen(on ? null : i)}
                className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 py-3 text-left text-base font-semibold"
              >
                {f.q}
                <ChevronDown aria-hidden className={cn("size-4 shrink-0 stroke-3 transition duration-300", on && "rotate-180")} />
              </button>
            </h3>
            <div id={`faq-${i}`} hidden={!on} className="animate-fade-in pb-4.5 leading-relaxed text-body">
              {f.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
