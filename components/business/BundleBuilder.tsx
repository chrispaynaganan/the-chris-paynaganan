"use client";

import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { SegmentedControl, Switch } from "glisse";
import { cn } from "@/lib/cn";
import { buttonClass } from "@/components/ui/button";
import { RollingNumber } from "@/components/motion/RollingNumber";
import type { Bundle, BuilderItem } from "@/types/content";

type Line = "business" | "personal";
type Picks = Record<string, number | string>;

const peso = (n: number) => `₱${Math.round(n).toLocaleString("en-PH")}`;
const plural = (n: number, unit = "") => `${n} ${unit}${n === 1 ? "" : "s"}`;
const priceOf = (x: { personal?: number; business?: number }, line: Line) => x[line];
const parsePeso = (v: string) => Number(v.replace(/[^\d]/g, "")) || 0;

/** The option a choice starts on for this line, skipping options that line doesn't offer. */
function startOption(item: BuilderItem, line: Line, wanted = item.startOption) {
  const offered = (item.options ?? []).filter((o) => priceOf(o, line) !== undefined);
  return (offered.find((o) => o.id === wanted) ?? offered.find((o) => o.id !== "none") ?? offered[0])?.id ?? "";
}

function startPicks(items: BuilderItem[], line: Line): Picks {
  const p: Picks = {};
  for (const it of items) p[it.id] = it.kind === "choice" ? startOption(it, line) : (it.start ?? 0);
  return p;
}

/**
 * "Build your own bundle": visitors pick what they need and see the price add up as they go.
 * Every price is hours × the line's rate, the same as the bundles (without the bundle saving).
 */
export function BundleBuilder({
  rates,
  items,
  bundles,
}: {
  rates: { personal: number; business: number };
  items: BuilderItem[];
  bundles: { personal: Bundle[]; business: Bundle[] };
}) {
  const [line, setLine] = useState<Line>("business");
  const [picks, setPicks] = useState<Picks>(() => startPicks(items, "business"));

  const offered = items.filter((it) => (it.kind === "choice" ? (it.options ?? []).some((o) => priceOf(o, line) !== undefined) : priceOf(it, line) !== undefined));
  const sections = [...new Set(offered.map((it) => it.section))];
  const [tab, setTab] = useState(0);
  const current = sections[Math.min(tab, sections.length - 1)];
  const labelOf = (it: BuilderItem) => it.labels?.[line] ?? it.label;

  const switchLine = (next: Line) => {
    setLine(next);
    // Keep what they picked, but move a choice to the matching option on the other line (Built-in CMS ↔ Webflow)
    setPicks((prev) => {
      const p = { ...prev };
      for (const it of items) if (it.kind === "choice") p[it.id] = startOption(it, next, String(prev[it.id] ?? ""));
      return p;
    });
  };

  const set = (id: string, v: number | string) => setPicks((p) => ({ ...p, [id]: v }));

  const lines = useMemo(() => {
    const out: { id: string; label: string; amount: number; monthly?: { months: number; each: number } }[] = [];
    for (const it of offered) {
      const v = picks[it.id];
      if (it.kind === "choice") {
        const o = it.options?.find((x) => x.id === v);
        const amount = o ? (priceOf(o, line) ?? 0) : 0;
        if (o && amount > 0) out.push({ id: it.id, label: `${labelOf(it)}: ${o.label}`, amount });
        continue;
      }
      const each = priceOf(it, line) ?? 0;
      const n = Number(v) || 0;
      if (it.kind === "fixed") out.push({ id: it.id, label: labelOf(it), amount: each });
      else if (it.kind === "toggle" && n) out.push({ id: it.id, label: labelOf(it), amount: each });
      else if (it.kind === "count" && n) out.push({ id: it.id, label: `${labelOf(it)} × ${n}`, amount: each * n });
      else if (it.kind === "monthly" && n) out.push({ id: it.id, label: `${labelOf(it)}, ${plural(n, it.unit)}`, amount: each * n, monthly: { months: n, each } });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picks, line, items]);

  const oneTime = lines.filter((l) => !l.monthly).reduce((s, l) => s + l.amount, 0);
  const monthly = lines.find((l) => l.monthly);
  const total = oneTime + (monthly?.amount ?? 0);
  // Build time: hours at 5 a day, plus about a quarter more for waiting on feedback
  const weeks = Math.max(1, Math.ceil(((oneTime / rates[line]) * 1.25) / 25));

  // The biggest bundle the build already costs as much as: worth a look, since bundles cost less than their parts
  const near = [...bundles[line]].sort((a, b) => parsePeso(b.payInFull.php) - parsePeso(a.payInFull.php)).find((b) => parsePeso(b.payInFull.php) <= oneTime);

  const send = () => {
    const summary = [
      `Custom bundle (${line === "business" ? "for business" : "for personal"})`,
      ...lines.map((l) => `- ${l.label}: ${peso(l.amount)}${l.monthly ? ` (${peso(l.monthly.each)}/mo)` : ""}`),
      `One-time: ${peso(oneTime)}`,
      monthly ? `Maintenance: ${peso(monthly.amount)}` : "",
      `Estimated total: ${peso(total)} · about ${plural(weeks, "week")}`,
    ]
      .filter(Boolean)
      .join("\n");
    window.dispatchEvent(new CustomEvent("custom-bundle", { detail: summary }));
    document.getElementById("inquire")?.scrollIntoView({ behavior: "smooth" });
  };

  const stepper = (it: BuilderItem) => {
    const n = Number(picks[it.id]) || 0;
    const min = it.min ?? 0;
    const max = it.max ?? 99;
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`Fewer ${it.unit ?? ""}s`}
          disabled={n <= min}
          onClick={() => set(it.id, Math.max(min, n - 1))}
          className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-paper/30 transition hover:bg-paper/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Minus aria-hidden className="size-4" />
        </button>
        <span aria-live="polite" className="w-28 text-center text-sm whitespace-nowrap tabular-nums">
          {plural(n, it.unit)}
        </span>
        <button
          type="button"
          aria-label={`More ${it.unit ?? ""}s`}
          disabled={n >= max}
          onClick={() => set(it.id, Math.min(max, n + 1))}
          className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-paper/30 transition hover:bg-paper/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Plus aria-hidden className="size-4" />
        </button>
      </div>
    );
  };

  const control = (it: BuilderItem) => {
    if (it.kind === "fixed") return <span className="text-sm text-paper/60">Included</span>;
    if (it.kind === "toggle") return <Switch aria-label={labelOf(it)} checked={Boolean(picks[it.id])} onCheckedChange={(on: boolean) => set(it.id, on ? 1 : 0)} />;
    if (it.kind === "count" || it.kind === "monthly") return stepper(it);
    return null;
  };

  const priceNote = (it: BuilderItem) => {
    const each = priceOf(it, line);
    if (each === undefined || it.kind === "choice") return null;
    if (it.kind === "count") return `${peso(each)} per ${it.unit}`;
    if (it.kind === "monthly") return `${peso(each)} a month`;
    return peso(each);
  };

  return (
    <div className="flex flex-col gap-8">
      <SegmentedControl
        aria-label="Build for"
        className="self-start"
        items={[
          { value: "business", label: "For business" },
          { value: "personal", label: "For personal" },
        ]}
        value={line}
        onValueChange={(v) => switchLine(v as Line)}
      />

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-8">
          {/* One section at a time, so the builder stays about a screen tall */}
          <div role="tablist" aria-label="Sections" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {sections.map((sec, i) => {
              const on = sec === current;
              const picked = lines.filter((l) => offered.find((it) => it.id === l.id)?.section === sec).length;
              return (
                <button
                  key={sec}
                  type="button"
                  role="tab"
                  id={`byo-tab-${i}`}
                  aria-selected={on}
                  aria-controls="byo-panel"
                  onClick={() => setTab(i)}
                  className={cn(
                    "flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm whitespace-nowrap transition",
                    on ? "border-paper bg-paper text-ink" : "border-paper/30 text-paper/80 hover:border-paper/70",
                  )}
                >
                  {sec}
                  {picked > 0 && (
                    <span className={cn("rounded-full px-1.5 text-xs tabular-nums", on ? "bg-ink text-paper" : "bg-paper/15 text-paper")}>{picked}</span>
                  )}
                </button>
              );
            })}
          </div>
          {[current].map((sec) => (
            <fieldset key={sec} id="byo-panel" role="tabpanel" aria-labelledby={`byo-tab-${sections.indexOf(sec)}`} className="flex flex-col">
              <legend className="sr-only">{sec}</legend>
              {offered
                .filter((it) => it.section === sec)
                .map((it) => (
                  <div key={it.id} className="flex flex-col gap-4 border-b border-paper/15 py-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex max-w-xl flex-col gap-1">
                        <span className="text-lg">{labelOf(it)}</span>
                        {it.description && <span className="text-sm text-paper/55">{it.description}</span>}
                        {priceNote(it) && <span className="text-sm text-paper/80">{priceNote(it)}</span>}
                      </div>
                      {control(it)}
                    </div>
                    {it.kind === "choice" && (
                      <div role="radiogroup" aria-label={labelOf(it)} className="flex flex-wrap gap-2">
                        {(it.options ?? [])
                          .filter((o) => priceOf(o, line) !== undefined)
                          .map((o) => {
                            const on = picks[it.id] === o.id;
                            const p = priceOf(o, line) ?? 0;
                            return (
                              <button
                                key={o.id}
                                type="button"
                                role="radio"
                                aria-checked={on}
                                onClick={() => set(it.id, o.id)}
                                className={cn(
                                  "flex cursor-pointer flex-col items-start gap-0.5 rounded-2xl border px-4 py-2.5 text-left text-sm transition",
                                  on ? "border-paper bg-paper text-ink" : "border-paper/30 text-paper/85 hover:border-paper/70",
                                )}
                              >
                                <span className="font-medium">{o.label}</span>
                                <span className={on ? "text-muted" : "text-paper/55"}>{p ? peso(p) : "No charge"}</span>
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>
                ))}
            </fieldset>
          ))}
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setTab(Math.max(0, sections.indexOf(current) - 1))}
              disabled={sections.indexOf(current) === 0}
              className={buttonClass("tertiary", "disabled:invisible", true)}
            >
              Back: {sections[sections.indexOf(current) - 1] ?? ""}
            </button>
            {sections.indexOf(current) < sections.length - 1 && (
              <button type="button" onClick={() => setTab(sections.indexOf(current) + 1)} className={buttonClass("secondary", undefined, true)}>
                Next: {sections[sections.indexOf(current) + 1]}
              </button>
            )}
          </div>
        </div>

        <aside aria-label="Your bundle" className="lg:col-span-4">
          <div className="flex flex-col gap-6 rounded-panel bg-paper p-8 text-ink lg:sticky lg:top-24">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium tracking-widest text-muted uppercase">Your bundle</span>
              <RollingNumber value={peso(total)} className="text-5xl font-semibold tracking-tighter" />
              <span className="text-sm text-muted">
                About {plural(weeks, "week")} · {oneTime === total ? "one-time" : `${peso(oneTime)} one-time + ${peso(monthly?.amount ?? 0)} maintenance`}
              </span>
            </div>
            <ul className="flex flex-col gap-2 border-t border-line pt-4 text-sm">
              {lines.map((l) => (
                <li key={l.id} className="flex justify-between gap-4">
                  <span className="text-body">{l.label}</span>
                  <span className="shrink-0 tabular-nums">{peso(l.amount)}</span>
                </li>
              ))}
            </ul>
            {near && (
              <p className="rounded-card bg-ok-bg p-4 text-sm text-ok">
                {near.name} is {near.payInFull.php} and already costs less than its parts. Compare it with your build before you send.
              </p>
            )}
            <div className="flex flex-col gap-2">
              <button type="button" onClick={send} className={buttonClass("primary", "w-full")}>
                Send this build to Chris
              </button>
              <span className="text-xs text-muted">An estimate. I’ll confirm the final price in your quotation, locked in PHP.</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
