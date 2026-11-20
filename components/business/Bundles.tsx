"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonClass } from "@/components/ui/button";
import type { Bundle } from "@/types/content";

export function Bundles({ bundles }: { bundles: Bundle[] }) {
  const [full, setFull] = useState(true);
  const seg = (on: boolean) =>
    cn("min-h-10 cursor-pointer rounded-full px-4 text-sm font-semibold transition", on ? "bg-ink text-paper" : "text-ink hover:bg-placeholder-alt");

  const choose = (name: string) => {
    window.dispatchEvent(new CustomEvent("choose-bundle", { detail: name }));
    document.getElementById("inquire")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-6">
      <div role="group" aria-label="Payment option" className="flex self-start rounded-full bg-placeholder p-1 md:self-end">
        <button type="button" aria-pressed={full} onClick={() => setFull(true)} className={seg(full)}>Pay in full</button>
        <button type="button" aria-pressed={!full} onClick={() => setFull(false)} className={seg(!full)}>Other payment options</button>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {bundles.map((b, i) => {
          const price = full ? b.payInFull : b.installments;
          return (
            <article
              key={b.name}
              className={cn(
                "flex animate-fade-up flex-col gap-4.5 rounded-2xl bg-paper p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lift",
                b.popular ? "border-2 border-ink" : "border border-line-strong",
              )}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex min-h-7 items-center justify-between gap-2">
                <h3 className="text-xl font-bold">{b.name}</h3>
                {b.popular && <span className="rounded bg-ink px-2 py-1 text-xs font-bold tracking-wider text-paper uppercase">Most picked</span>}
              </div>
              <div key={String(full)} className="flex animate-fade-in flex-col gap-0.5">
                <span className="text-sm text-muted">{full ? "Pay in full" : "From, with installments"}</span>
                <span className="text-4xl font-extrabold tracking-tight">{price.usd}</span>
                <span className="text-sm text-muted">{price.php} · per project</span>
              </div>
              {b.save && full && <span className="self-start rounded-full bg-ok-bg px-2.5 py-1 text-sm font-bold text-ok">{b.save}</span>}
              <ul className="flex flex-1 flex-col gap-2.5">
                {b.items.map((it) => (
                  <li key={it} className="flex items-start gap-2.5 text-sm leading-snug">
                    <Check aria-hidden className="mt-0.5 size-4 shrink-0 stroke-3" /> {it}
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => choose(b.name)} className={buttonClass(b.popular ? "primary" : "secondary")}>
                Choose {b.name}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
