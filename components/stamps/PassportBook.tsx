"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonClass } from "@/components/ui/button";
import type { PassportStamp } from "@/types/content";
import { PressedStamp } from "./PressedStamp";

type Holder = { name: string; role: string; location: string; since: number };
type Leaf = {
  kind: "open" | "close" | "turn";
  side: "left" | "right";
  front: React.ReactNode;
  back: React.ReactNode;
  from: number;
  to: number;
  done: () => void;
};

const PER_PAGE = 4;
const TURN = { duration: 0.85, ease: [0.65, 0, 0.35, 1] as const };
const tilts = [-7, 4, -3, 6, -5, 3, -2, 5, -4, 2];

function useWide() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(min-width: 768px)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 768px)").matches,
    () => true,
  );
}

/* ---------- Page faces ---------- */

function Paper({ side, children, label }: { side: "left" | "right" | "single"; children: React.ReactNode; label?: string }) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col bg-paper p-5 md:p-7",
        side === "left" && "rounded-l-2xl shadow-spine-left",
        side === "right" && "rounded-r-2xl shadow-spine-right",
        side === "single" && "rounded-2xl",
      )}
    >
      <div className="flex h-full flex-col rounded-lg border border-line p-4">
        {label && <span className="pb-3 text-xs font-medium tracking-widest text-muted uppercase">{label}</span>}
        {children}
      </div>
    </div>
  );
}

function Cover() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-between rounded-2xl bg-ink p-8 text-paper md:rounded-l-none md:rounded-r-2xl">
      <span className="text-xs font-medium tracking-widest text-paper/70 uppercase">Design passport</span>
      <div className="flex flex-col items-center gap-5">
        <span className="flex size-24 items-center justify-center rounded-full border-2 border-paper/70">
          <span className="flex size-18 items-center justify-center rounded-full border border-paper/40 text-2xl font-semibold tracking-tight">CP</span>
        </span>
        <span className="text-3xl font-semibold tracking-widest">PASSPORT</span>
      </div>
      <span className="text-sm font-medium tracking-widest uppercase">Chris Paynaganan</span>
    </div>
  );
}

function IdentityPage({ holder, earned, side }: { holder: Holder; earned: number; side: "left" | "single" }) {
  const rows: [string, string][] = [
    ["Holder", holder.name],
    ["Role", holder.role],
    ["Place of issue", holder.location],
    ["Designing since", String(holder.since)],
    ["Stamps", `${earned} earned`],
  ];
  const mrz = `P<PHL${holder.name.split(" ").reverse().join("<<").toUpperCase()}`.padEnd(36, "<");
  return (
    <Paper side={side} label="Passport · Page 1">
      <div className="flex flex-1 gap-4">
        <div className="flex aspect-3/4 w-1/3 shrink-0 items-center justify-center self-start rounded-md bg-placeholder text-xs text-muted">[Photo]</div>
        <dl className="flex min-w-0 flex-1 flex-col gap-2.5">
          {rows.map(([k, v]) => (
            <div key={k} className="flex flex-col">
              <dt className="text-xs text-muted uppercase">{k}</dt>
              <dd className="truncate text-sm font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p aria-hidden className="truncate pt-3 font-mono text-xs tracking-widest text-muted">
        {mrz}
      </p>
    </Paper>
  );
}

function StampPage({ stamps, page, side, still, offset }: { stamps: PassportStamp[]; page: number; side: "left" | "right" | "single"; still: boolean; offset: number }) {
  return (
    <Paper side={side} label={`Entries · Page ${page}`}>
      <ul className="grid flex-1 grid-cols-2 content-center gap-x-4 gap-y-5">
        {stamps.map((s, i) => (
          <li key={s.id} className="flex flex-col items-center gap-1.5 text-center">
            <div className="w-full max-w-28">
              <PressedStamp stamp={s} tilt={tilts[(offset + i) % tilts.length]} delay={0.15 + i * 0.12} still={still} />
            </div>
            {s.earned ? (
              <span className="line-clamp-1 text-xs text-muted">
                {s.projects.map((p, j) => (
                  <span key={p.slug}>
                    {j > 0 && ", "}
                    <Link href={`/projects/${p.slug}`} className="underline underline-offset-2 hover:text-ink">
                      {p.name}
                    </Link>
                  </span>
                ))}
              </span>
            ) : (
              <span className="text-xs text-muted">Next stop</span>
            )}
          </li>
        ))}
      </ul>
    </Paper>
  );
}

function BlankPage({ side, page }: { side: "left" | "right" | "single"; page: number }) {
  return (
    <Paper side={side} label={`Notes · Page ${page}`}>
      <span className="m-auto text-sm text-muted">Room for the next adventure.</span>
    </Paper>
  );
}

/* ---------- The book ---------- */

export function PassportBook({ stamps, holder }: { stamps: PassportStamp[]; holder: Holder }) {
  const wide = useWide();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0); // spread (wide) or page (narrow)
  const [leaf, setLeaf] = useState<Leaf | null>(null);

  const earned = stamps.filter((s) => s.earned).length;
  const groups: PassportStamp[][] = [];
  for (let i = 0; i < stamps.length; i += PER_PAGE) groups.push(stamps.slice(i, i + PER_PAGE));
  const pageCount = 1 + groups.length + (wide && (1 + groups.length) % 2 ? 1 : 0);

  /** Page n (0-based), drawn for a given side. */
  const page = useCallback(
    (n: number, side: "left" | "right" | "single", still = false): React.ReactNode => {
      if (n === 0) return <IdentityPage holder={holder} earned={earned} side={side === "right" ? "single" : (side as "left" | "single")} />;
      const g = groups[n - 1];
      if (!g) return <BlankPage side={side} page={n + 1} />;
      return <StampPage key={`p${n}-${still}`} stamps={g} page={n + 1} side={side} still={still} offset={(n - 1) * PER_PAGE} />;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [holder, earned, stamps],
  );

  const views = wide ? Math.ceil(pageCount / 2) : pageCount;
  const busy = leaf !== null;

  const openBook = useCallback(() => {
    if (open || busy) return;
    if (reduce) {
      setOpen(true);
      setIndex(0);
      return;
    }
    setLeaf({
      kind: "open",
      side: "right",
      front: <Cover />,
      back: wide ? page(0, "left", true) : <Paper side="single">{null}</Paper>,
      from: 0,
      to: -180,
      done: () => {
        setOpen(true);
        setIndex(0);
        setLeaf(null);
      },
    });
  }, [open, busy, reduce, wide, page]);

  // Open on its own the first time it scrolls into view
  useEffect(() => {
    if (!inView || open) return;
    const t = setTimeout(openBook, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  const closeBook = () => {
    if (!open || busy) return;
    if (reduce) {
      setOpen(false);
      setIndex(0);
      return;
    }
    setIndex(0);
    setLeaf({
      kind: "close",
      side: "right",
      front: <Cover />,
      back: wide ? page(0, "left", true) : <Paper side="single">{null}</Paper>,
      from: -180,
      to: 0,
      done: () => {
        setOpen(false);
        setLeaf(null);
      },
    });
  };

  const turn = (dir: 1 | -1) => {
    if (!open || busy) return;
    const target = index + dir;
    if (target < 0 || target >= views) return;
    if (reduce) {
      setIndex(target);
      return;
    }
    const done = () => {
      setIndex(target);
      setLeaf(null);
    };
    const blank = <Paper side="single">{null}</Paper>;
    const L = index * 2;
    if (wide && dir === 1) setLeaf({ kind: "turn", side: "right", front: page(L + 1, "right", true), back: page(L + 2, "left", true), from: 0, to: -180, done });
    else if (wide) setLeaf({ kind: "turn", side: "left", front: page(L, "left", true), back: page(L - 1, "right", true), from: 0, to: 180, done });
    else if (dir === 1) setLeaf({ kind: "turn", side: "right", front: page(index, "single", true), back: blank, from: 0, to: -180, done });
    else setLeaf({ kind: "turn", side: "right", front: page(target, "single", true), back: blank, from: -180, to: 0, done });
  };

  // What sits underneath while a page turns
  const L = index * 2;
  let under: { left?: React.ReactNode; right?: React.ReactNode; single?: React.ReactNode };
  if (!open || leaf?.kind === "close") {
    under = wide ? { right: leaf ? page(1, "right") : undefined } : { single: leaf ? page(0, "single") : undefined };
  } else if (wide) {
    const nextL = leaf?.side === "right" && leaf.to === -180 ? L + 2 : null;
    const prevL = leaf?.side === "left" ? L - 2 : null;
    under = {
      left: page(prevL ?? L, "left"),
      right: page(nextL !== null ? nextL + 1 : L + 1, "right"),
    };
  } else {
    const showing = leaf && leaf.to === -180 ? index + 1 : index;
    under = { single: page(Math.min(showing, pageCount - 1), "single") };
  }

  // Swipe to turn
  const startX = useRef<number | null>(null);
  const label = wide
    ? `Pages ${index * 2 + 1}–${Math.min(index * 2 + 2, pageCount)} of ${pageCount}`
    : `Page ${index + 1} of ${pageCount}`;

  return (
    <div ref={ref} className="flex flex-col items-center gap-6">
      <motion.div
        role="region"
        aria-roledescription="book"
        aria-label={`Design passport. ${open ? label : "Closed"}. Use the arrow keys to turn pages.`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            if (open) turn(1);
            else openBook();
          }
          if (e.key === "ArrowLeft") turn(-1);
        }}
        onPointerDown={(e) => (startX.current = e.clientX)}
        onPointerUp={(e) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (Math.abs(dx) > 50) turn(dx < 0 ? 1 : -1);
        }}
        // While closed on wide screens, the book (just its cover) sits centred
        animate={{ x: wide && !open && !leaf ? "-25%" : "0%" }}
        transition={{ duration: reduce ? 0 : 0.7, ease: [0.65, 0, 0.35, 1] }}
        className={cn(
          "relative w-full touch-pan-y rounded-2xl perspective-distant focus-visible:outline-2 focus-visible:outline-offset-8",
          wide ? "aspect-10/7 max-w-4xl" : "aspect-5/7 max-w-sm",
        )}
      >
        {/* Book shadow */}
        <div aria-hidden className={cn("absolute inset-y-0 rounded-2xl shadow-book transition-all duration-700", wide ? (open || leaf ? "inset-x-0" : "left-1/2 right-0") : "inset-x-0")} />

        {/* Pages underneath */}
        {wide ? (
          <>
            <div className="absolute inset-y-0 left-0 w-1/2">{under.left}</div>
            <div className="absolute inset-y-0 right-0 w-1/2">{under.right}</div>
          </>
        ) : (
          <div className="absolute inset-0">{under.single}</div>
        )}

        {/* Closed cover */}
        {!open && !leaf && (
          <button
            type="button"
            onClick={openBook}
            aria-label="Open the passport"
            className={cn("absolute inset-y-0 cursor-pointer transition duration-500 hover:-rotate-y-6", wide ? "right-0 w-1/2 origin-left" : "inset-x-0 origin-left")}
          >
            <Cover />
          </button>
        )}

        {/* The turning page */}
        {leaf && (
          <motion.div
            key={`${leaf.side}-${leaf.from}-${leaf.to}-${index}`}
            className={cn(
              "absolute inset-y-0 z-10 transform-3d",
              wide ? (leaf.side === "right" ? "right-0 w-1/2 origin-left" : "left-0 w-1/2 origin-right") : "inset-x-0 origin-left",
            )}
            initial={{ rotateY: leaf.from }}
            animate={{ rotateY: leaf.to }}
            transition={TURN}
            onAnimationComplete={leaf.done}
          >
            <div className="absolute inset-0 backface-hidden">{leaf.front}</div>
            <div className="absolute inset-0 rotate-y-180 backface-hidden">{leaf.back}</div>
          </motion.div>
        )}
      </motion.div>

      <div className="flex w-full max-w-4xl items-center justify-between gap-4">
        <button type="button" onClick={() => turn(-1)} disabled={!open || busy || index === 0} className={buttonClass("secondary", "h-10 w-10 px-0")} aria-label="Previous pages">
          <ChevronLeft aria-hidden className="size-4" />
        </button>
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-medium" aria-live="polite">
            {open ? label : "Closed"}
          </span>
          {open ? (
            <button type="button" onClick={closeBook} disabled={busy} className={buttonClass("tertiary", "text-xs")}>
              Close passport
            </button>
          ) : (
            <button type="button" onClick={openBook} disabled={busy} className={buttonClass("tertiary", "text-xs")}>
              Open passport
            </button>
          )}
        </div>
        <button type="button" onClick={() => {
            if (open) turn(1);
            else openBook();
          }} disabled={busy || (open && index >= views - 1)} className={buttonClass("secondary", "h-10 w-10 px-0")} aria-label="Next pages">
          <ChevronRight aria-hidden className="size-4" />
        </button>
      </div>
    </div>
  );
}
