"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, ChevronUp, LoaderCircle, PanelLeft, Search, X } from "lucide-react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { cn } from "@/lib/cn";

type Pdfjs = typeof import("pdfjs-dist");
type Size = { w: number; h: number };
/** One search hit: the page it's on and its order among that page's hits */
type Match = { page: number; n: number };

// pdf.js is only downloaded the first time someone opens a document
let pdfjsPromise: Promise<Pdfjs> | null = null;
function loadPdfjs() {
  pdfjsPromise ??= import("pdfjs-dist").then((pdfjs) => {
    // Copied into public/ by scripts/copy-pdf-worker.mjs on npm install
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    return pdfjs;
  });
  return pdfjsPromise;
}

const noop = () => () => {};
const PAGE_GAP = 24;
const MAX_PAGE_WIDTH = 1100;

/**
 * A document reader in a pop-up: pages on the right, a page strip on the left that folds away,
 * and its own find bar (Cmd/Ctrl + F) that searches every page, not just the ones on screen.
 * Click outside the panel or press Escape to close.
 */
export function PdfReader({ open, onClose, src, title }: { open: boolean; onClose: () => void; src: string; title: string }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus();
    };
  }, [open]);

  // Render nothing on the server and during hydration, so an already-open reader doesn't mismatch
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  if (!hydrated) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            aria-hidden
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/60"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 16 }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className="absolute inset-3 flex flex-col overflow-hidden rounded-panel bg-paper shadow-float md:inset-8"
          >
            <ReaderBody src={src} title={title} onClose={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function ReaderBody({ src, title, onClose }: { src: string; title: string; onClose: () => void }) {
  const [pdfjs, setPdfjs] = useState<Pdfjs | null>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [failed, setFailed] = useState(false);
  const [sidebar, setSidebar] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches);
  const [width, setWidth] = useState(0);
  const [current, setCurrent] = useState(1);

  const [findOpen, setFindOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [active, setActive] = useState(0);
  const [searching, setSearching] = useState(false);
  const [focusToken, setFocusToken] = useState(0);

  const mainRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const findRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const textCache = useRef<Promise<string[][]> | null>(null);

  // Load the document and every page's size, so the scroll height is right from the start
  useEffect(() => {
    let cancelled = false;
    let loading: ReturnType<Pdfjs["getDocument"]> | null = null;
    closeRef.current?.focus();
    (async () => {
      try {
        const lib = await loadPdfjs();
        if (cancelled) return;
        loading = lib.getDocument({ url: src });
        const loaded = await loading.promise;
        const all = await Promise.all(
          Array.from({ length: loaded.numPages }, async (_, i) => {
            const vp = (await loaded.getPage(i + 1)).getViewport({ scale: 1 });
            return { w: vp.width, h: vp.height };
          }),
        );
        if (cancelled) return;
        setPdfjs(lib);
        setDoc(loaded);
        setSizes(all);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      textCache.current = null;
      void loading?.destroy();
    };
  }, [src]);

  // Pages fit the reading column's width
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scaleFor = (s: Size) => Math.max(0.1, Math.min(width - 2 * PAGE_GAP, MAX_PAGE_WIDTH) / s.w);

  const onScroll = () => {
    const el = mainRef.current;
    if (!el) return;
    const line = el.scrollTop + el.clientHeight / 3;
    let page = 1;
    pageRefs.current.forEach((p, i) => {
      if (p && p.offsetTop <= line) page = i + 1;
    });
    setCurrent(page);
  };

  const goTo = useCallback((page: number) => {
    const el = pageRefs.current[page - 1];
    const main = mainRef.current;
    if (el && main) main.scrollTo({ top: el.offsetTop - PAGE_GAP });
  }, []);

  // Keyboard: Cmd/Ctrl + F opens find, Escape closes find first, then the reader
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setFindOpen(true);
        requestAnimationFrame(() => findRef.current?.select());
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (findOpen) setFindOpen(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [findOpen, onClose]);

  // Search every page's text, not just the rendered ones
  const term = findOpen ? query.trim().toLowerCase() : "";
  useEffect(() => {
    if (!doc || !term) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      textCache.current ??= Promise.all(
        Array.from({ length: doc.numPages }, async (_, i) => {
          const content = await (await doc.getPage(i + 1)).getTextContent();
          return content.items.map((it) => ("str" in it ? it.str.toLowerCase() : ""));
        }),
      );
      const texts = await textCache.current;
      if (cancelled) return;
      const found: Match[] = [];
      texts.forEach((items, p) => {
        let n = 0;
        for (const str of items) {
          for (let at = str.indexOf(term); at !== -1; at = str.indexOf(term, at + term.length)) found.push({ page: p + 1, n: n++ });
        }
      });
      setMatches(found);
      setActive(0);
      setSearching(false);
      if (found.length) {
        goTo(found[0].page);
        setFocusToken((t) => t + 1);
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [doc, term, goTo]);

  // Hits only count while the find bar has a term in it
  const shown = term ? matches : [];

  const step = (dir: 1 | -1) => {
    if (!shown.length) return;
    const next = (active + dir + matches.length) % matches.length;
    setActive(next);
    goTo(matches[next].page);
    setFocusToken((t) => t + 1);
  };

  const hit = shown[active];
  const numPages = sizes.length;

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-3">
        <button
          type="button"
          onClick={() => setSidebar((v) => !v)}
          aria-label={sidebar ? "Hide pages" : "Show pages"}
          aria-expanded={sidebar}
          className={iconButton}
        >
          <PanelLeft aria-hidden className="size-4.5" />
        </button>
        <span className="min-w-0 flex-1 truncate font-medium">{title}</span>
        {numPages > 0 && (
          <span className="hidden text-sm text-muted tabular-nums sm:block">
            Page {current} of {numPages}
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            setFindOpen(true);
            requestAnimationFrame(() => findRef.current?.select());
          }}
          aria-label="Find in document"
          className={iconButton}
        >
          <Search aria-hidden className="size-4.5" />
        </button>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className={iconButton}>
          <X aria-hidden className="size-4.5" />
        </button>
      </header>

      {findOpen && (
        <div className="flex shrink-0 items-center gap-2 border-b border-line bg-surface px-3 py-2">
          <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-line-strong bg-paper px-3 focus-within:border-ink md:max-w-sm">
            <Search aria-hidden className="size-4 shrink-0 text-muted" />
            <input
              ref={findRef}
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  step(e.shiftKey ? -1 : 1);
                }
              }}
              placeholder="Find in document"
              aria-label="Find in document"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
          <span className="w-20 shrink-0 text-sm text-muted tabular-nums" aria-live="polite">
            {searching ? "Searching…" : term ? (shown.length ? `${active + 1} of ${shown.length}` : "No results") : ""}
          </span>
          <button type="button" onClick={() => step(-1)} disabled={!shown.length} aria-label="Previous result" className={iconButton}>
            <ChevronUp aria-hidden className="size-4.5" />
          </button>
          <button type="button" onClick={() => step(1)} disabled={!shown.length} aria-label="Next result" className={iconButton}>
            <ChevronDown aria-hidden className="size-4.5" />
          </button>
          <button type="button" onClick={() => setFindOpen(false)} aria-label="Close find" className={iconButton}>
            <X aria-hidden className="size-4" />
          </button>
        </div>
      )}

      <div className="relative flex min-h-0 flex-1">
        <aside
          aria-label="Pages"
          aria-hidden={!sidebar}
          inert={!sidebar}
          className={cn(
            "absolute inset-y-0 left-0 z-10 shrink-0 overflow-x-hidden overflow-y-auto border-line bg-paper transition-all duration-300 ease-out md:static",
            sidebar ? "w-52 border-r" : "w-0",
          )}
        >
          {doc && pdfjs && (
            <ol className="flex w-52 flex-col items-center gap-4 p-4">
              {sizes.map((s, i) => (
                <li key={i}>
                  <Thumb doc={doc} index={i} size={s} active={current === i + 1} follow={sidebar} onPick={() => goTo(i + 1)} />
                </li>
              ))}
            </ol>
          )}
        </aside>

        <div ref={mainRef} onScroll={onScroll} className="min-w-0 flex-1 overflow-y-auto bg-surface">
          {failed ? (
            <p className="p-8 text-center text-muted">Sorry, this document couldn’t be opened right now.</p>
          ) : !doc || !pdfjs || width === 0 ? (
            <p className="flex items-center justify-center gap-2 p-8 text-muted">
              <LoaderCircle aria-hidden className="size-4 animate-spin" /> Opening the document…
            </p>
          ) : (
            <div className="flex flex-col items-center gap-6 p-6">
              {sizes.map((s, i) => (
                <Page
                  key={i}
                  ref={(el) => {
                    pageRefs.current[i] = el;
                  }}
                  pdfjs={pdfjs}
                  doc={doc}
                  index={i}
                  size={s}
                  scale={scaleFor(s)}
                  root={mainRef}
                  term={term}
                  activeN={hit && hit.page === i + 1 ? hit.n : -1}
                  focusToken={focusToken}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const iconButton =
  "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40";

/** Wraps every hit inside the page's text layer in a <mark>; returns the current hit, if it's on this page. */
function highlight(layer: HTMLElement, term: string, activeN: number) {
  let n = 0;
  let activeMark: HTMLElement | null = null;
  layer.querySelectorAll<HTMLSpanElement>("span").forEach((span) => {
    if (span.classList.contains("markedContent")) return;
    const text = span.dataset.text ?? span.textContent ?? "";
    span.dataset.text = text;
    const lower = text.toLowerCase();
    if (!term || !lower.includes(term)) {
      if (span.childElementCount) span.textContent = text;
      return;
    }
    const frag = document.createDocumentFragment();
    let from = 0;
    for (let at = lower.indexOf(term); at !== -1; at = lower.indexOf(term, at + term.length)) {
      frag.append(text.slice(from, at));
      const mark = document.createElement("mark");
      mark.className = n === activeN ? "pdf-hit pdf-hit-active" : "pdf-hit";
      mark.textContent = text.slice(at, at + term.length);
      if (n === activeN) activeMark = mark;
      frag.append(mark);
      from = at + term.length;
      n++;
    }
    frag.append(text.slice(from));
    span.replaceChildren(frag);
  });
  return activeMark as HTMLElement | null;
}

/** Calls back once the element is within a screen or two of the scroll area, and again when it leaves. */
function useNear(ref: React.RefObject<HTMLElement | null>, root: React.RefObject<HTMLElement | null>, margin: string) {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { root: root.current, rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, root, margin]);
  return near;
}

function Page({
  ref,
  pdfjs,
  doc,
  index,
  size,
  scale,
  root,
  term,
  activeN,
  focusToken,
}: {
  ref: (el: HTMLDivElement | null) => void;
  pdfjs: Pdfjs;
  doc: PDFDocumentProxy;
  index: number;
  size: Size;
  scale: number;
  root: React.RefObject<HTMLDivElement | null>;
  term: string;
  activeN: number;
  focusToken: number;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const near = useNear(boxRef, root, "1200px 0px");
  const [ready, setReady] = useState(0);
  const handledToken = useRef(-1);

  // Draw the page and its selectable text while it's near the screen; free it when it's far away
  useEffect(() => {
    const canvas = canvasRef.current;
    const layer = layerRef.current;
    if (!canvas || !layer) return;
    if (!near) {
      canvas.width = 0;
      canvas.height = 0;
      layer.replaceChildren();
      return;
    }
    let cancelled = false;
    let task: RenderTask | null = null;
    let text: InstanceType<Pdfjs["TextLayer"]> | null = null;
    (async () => {
      const page = await doc.getPage(index + 1);
      if (cancelled) return;
      const viewport = page.getViewport({ scale });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      task = page.render({ canvasContext: ctx, canvas, viewport, transform: dpr === 1 ? undefined : [dpr, 0, 0, dpr, 0, 0] });
      try {
        await task.promise;
      } catch {
        return;
      }
      if (cancelled) return;
      layer.replaceChildren();
      text = new pdfjs.TextLayer({ textContentSource: page.streamTextContent(), container: layer, viewport });
      await text.render();
      if (!cancelled) setReady((r) => r + 1);
    })();
    return () => {
      cancelled = true;
      task?.cancel();
      text?.cancel();
    };
  }, [near, doc, index, scale, pdfjs]);

  // Highlight search hits, and bring the current one into view when it was just picked
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer || !ready) return;
    const mark = highlight(layer, term, activeN);
    if (mark && handledToken.current !== focusToken) {
      handledToken.current = focusToken;
      mark.scrollIntoView({ block: "center" });
    }
  }, [ready, term, activeN, focusToken]);

  return (
    <div
      ref={(el) => {
        boxRef.current = el;
        ref(el);
      }}
      aria-label={`Page ${index + 1}`}
      role="region"
      className="relative shrink-0 overflow-hidden rounded-sm bg-paper shadow-float"
      style={
        {
          width: size.w * scale,
          height: size.h * scale,
          "--total-scale-factor": scale,
          "--scale-round-x": "1px",
          "--scale-round-y": "1px",
        } as React.CSSProperties
      }
    >
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />
      <div ref={layerRef} className="textLayer" />
    </div>
  );
}

const THUMB_WIDTH = 160;

function Thumb({ doc, index, size, active, follow, onPick }: { doc: PDFDocumentProxy; index: number; size: Size; active: boolean; follow: boolean; onPick: () => void }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [seen, setSeen] = useState(false);
  const scale = THUMB_WIDTH / size.w;

  useEffect(() => {
    const el = btnRef.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { rootMargin: "400px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!seen || !canvas) return;
    let task: RenderTask | null = null;
    let cancelled = false;
    (async () => {
      const page = await doc.getPage(index + 1);
      if (cancelled) return;
      const viewport = page.getViewport({ scale });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      task = page.render({ canvasContext: ctx, canvas, viewport, transform: dpr === 1 ? undefined : [dpr, 0, 0, dpr, 0, 0] });
      await task.promise.catch(() => {});
    })();
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [seen, doc, index, scale]);

  useEffect(() => {
    // Keep the current page's thumbnail in view, without moving anything else
    const btn = btnRef.current;
    const list = btn?.closest("aside");
    if (!active || !follow || !btn || !list) return;
    const b = btn.getBoundingClientRect();
    const l = list.getBoundingClientRect();
    if (b.top < l.top || b.bottom > l.bottom) list.scrollBy({ top: b.top - l.top - l.height / 2 + b.height / 2 });
  }, [active, follow]);

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onPick}
      aria-label={`Go to page ${index + 1}`}
      aria-current={active ? "page" : undefined}
      className="group flex cursor-pointer flex-col items-center gap-1.5"
    >
      <span
        className={cn(
          "block overflow-hidden rounded-sm bg-placeholder outline-offset-2 transition",
          active ? "outline-2 outline-ink" : "outline-1 outline-line-strong group-hover:outline-field",
        )}
        style={{ width: THUMB_WIDTH, height: size.h * scale }}
      >
        <canvas ref={canvasRef} className="block size-full" />
      </span>
      <span className={cn("text-xs tabular-nums", active ? "font-medium text-ink" : "text-muted")}>{index + 1}</span>
    </button>
  );
}
