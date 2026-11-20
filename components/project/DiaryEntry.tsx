"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { DiaryEntry as Entry } from "@/types/content";
import { Sheet } from "@/components/ui/Sheet";

const LONG = 220;

/** One diary entry. Long ones are clipped to three lines with "Show more", which opens the full entry in a sheet. */
export function DiaryEntry({ entry, projectName }: { entry: Entry; projectName: string }) {
  const [open, setOpen] = useState(false);
  const long = entry.body.length > LONG;
  return (
    <article className="flex flex-col gap-2.5 border-b border-line py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="text-xl font-semibold">{entry.label}</h3>
        <span className="text-muted">{entry.date}</span>
      </div>
      <p className={long ? "line-clamp-3 text-lg" : "text-lg"}>{entry.body}</p>
      {long && (
        <button type="button" onClick={() => setOpen(true)} className="group flex cursor-pointer items-center gap-1 self-start font-medium underline underline-offset-4 hover:decoration-2">
          Show more <ChevronRight aria-hidden className="size-4 transition group-hover:translate-x-0.5" />
        </button>
      )}
      <Sheet open={open} onClose={() => setOpen(false)} title={`${projectName} · ${entry.label}`}>
        <div className="flex flex-col gap-3">
          <span className="text-muted">{entry.date}</span>
          <h2 className="text-2xl font-semibold">{entry.label}</h2>
          <p className="text-lg">{entry.body}</p>
        </div>
      </Sheet>
    </article>
  );
}
