"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Notice } from "@/components/ui/Notice";
import type { SiteContent } from "@/types/content";

const filters = [
  { id: "all", label: "All" },
  { id: "web", label: "Web Designs" },
  { id: "mobile", label: "Mobile App Designs" },
] as const;

export function GalleryGrid({ items }: { items: SiteContent["gallery"] }) {
  const [f, setF] = useState<(typeof filters)[number]["id"]>("all");
  const shown = items.filter((g) => f === "all" || g.category === f);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {filters.map((x) => (
          <button
            key={x.id}
            type="button"
            aria-pressed={f === x.id}
            onClick={() => setF(x.id)}
            className={cn(
              "h-9 cursor-pointer rounded-full border px-4 text-sm font-semibold transition active:scale-97",
              f === x.id ? "border-ink bg-ink text-paper" : "border-line-strong bg-paper hover:border-ink",
            )}
          >
            {x.label}
          </button>
        ))}
      </div>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((g, i) => (
          <li key={g.title} className="flex animate-fade-up flex-col gap-2.5" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex aspect-4/3 items-center justify-center rounded-2xl bg-placeholder text-xs text-muted">[Image · {g.title}]</div>
            <div className="flex justify-between gap-2">
              <span className="font-bold">{g.title}</span>
              <span className="text-sm text-muted">{g.date}</span>
            </div>
          </li>
        ))}
      </ul>
      {shown.length === 0 && <Notice tone="info" role="status" className="max-w-xl">Nothing pinned under this category yet.</Notice>}
    </div>
  );
}
