"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, Reorder, useDragControls } from "motion/react";
import { Check, ChevronDown, CircleAlert, GripVertical, Loader2, Maximize2, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { refreshSite } from "@/app/studio/actions";
import { bar, fill, text, type StudioColor } from "./colors";

/* ---------- Saving ---------- */

export type SaveState = "idle" | "saving" | "saved" | "error";

/** Runs a save and tracks "Saving… / Saved / Couldn't save". Content saves also refresh the public site. */
export function useSaver(refresh = true) {
  const [state, setState] = useState<SaveState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const run = useCallback(
    async (fn: () => PromiseLike<{ error: unknown } | void>) => {
      setState("saving");
      try {
        const res = await fn();
        if (res && res.error) throw res.error;
        setState("saved");
        if (refresh) {
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => void refreshSite(), 700);
        }
        return true;
      } catch {
        setState("error");
        return false;
      }
    },
    [refresh],
  );
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  return { state, run };
}

export function SaveStatus({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  return (
    <span role="status" className="flex items-center gap-1.5 text-sm text-studio-muted">
      {state === "saving" && <Loader2 aria-hidden className="size-3.5 animate-spin" />}
      {state === "saved" && <Check aria-hidden className="size-3.5 text-studio-green" />}
      {state === "error" && <CircleAlert aria-hidden className="size-3.5 text-studio-red" />}
      {state === "saving" ? "Saving…" : state === "saved" ? "Saved" : "Couldn’t save. Try again."}
    </span>
  );
}

/* ---------- Board header ---------- */

export function BoardHeader({
  title,
  description,
  views,
  view,
  onView,
  query,
  onQuery,
  onNew,
  newLabel = "New item",
  save,
}: {
  title: string;
  description: string;
  views?: { key: string; label: string }[];
  view?: string;
  onView?: (v: string) => void;
  query: string;
  onQuery: (v: string) => void;
  onNew?: () => void;
  newLabel?: string;
  save: SaveState;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-studio-line-soft px-6 pt-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-studio-muted">{description}</p>
        </div>
        <SaveStatus state={save} />
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        {views ? (
          <div role="tablist" aria-label="Views" className="flex gap-1">
            {views.map((v) => (
              <button
                key={v.key}
                type="button"
                role="tab"
                aria-selected={view === v.key}
                onClick={() => onView?.(v.key)}
                className={cn("relative h-9 cursor-pointer px-3 text-sm transition", view === v.key ? "text-studio-text" : "text-studio-muted hover:text-studio-text")}
              >
                {v.label}
                {view === v.key && <motion.span layoutId="view-underline" className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-studio-primary" />}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2 pb-2">
          <label className="flex h-8 items-center gap-2 rounded-md border border-studio-line px-2.5 focus-within:border-studio-primary">
            <Search aria-hidden className="size-4 text-studio-muted" />
            <span className="sr-only">Search this board</span>
            <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search" className="w-36 bg-transparent text-sm outline-none" />
          </label>
          {onNew && (
            <button type="button" onClick={onNew} className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md bg-studio-primary px-3 text-sm font-medium text-paper transition hover:bg-studio-primary-hover">
              <Plus aria-hidden className="size-4" /> {newLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Grouped table ---------- */

export type Column<T> = { key: string; label: string; width: string; render: (row: T) => React.ReactNode; flush?: boolean };
export type Group<T> = { key: string; label: string; color: StudioColor; rows: T[]; addable?: boolean };

export function GroupedTable<T>({
  groups,
  columns,
  getId,
  getTitle,
  onOpen,
  onAdd,
  onReorder,
  itemLabel = "Item",
}: {
  groups: Group<T>[];
  columns: Column<T>[];
  getId: (row: T) => string;
  getTitle: (row: T) => string;
  onOpen: (row: T) => void;
  onAdd?: (groupKey: string, title: string) => void;
  onReorder?: (groupKey: string, ids: string[]) => void;
  itemLabel?: string;
}) {
  const template = ["minmax(15rem, 2fr)", ...columns.map((c) => c.width)].join(" ");
  return (
    <div className="flex flex-col gap-8 px-6 py-6">
      {groups.map((g) => (
        <GroupBlock key={g.key} group={g} columns={columns} template={template} getId={getId} getTitle={getTitle} onOpen={onOpen} onAdd={onAdd} onReorder={onReorder} itemLabel={itemLabel} />
      ))}
    </div>
  );
}

function GroupBlock<T>({
  group,
  columns,
  template,
  getId,
  getTitle,
  onOpen,
  onAdd,
  onReorder,
  itemLabel,
}: {
  group: Group<T>;
  columns: Column<T>[];
  template: string;
  getId: (row: T) => string;
  getTitle: (row: T) => string;
  onOpen: (row: T) => void;
  onAdd?: (groupKey: string, title: string) => void;
  onReorder?: (groupKey: string, ids: string[]) => void;
  itemLabel: string;
}) {
  const [open, setOpen] = useState(true);
  const [order, setOrder] = useState(() => group.rows.map(getId));
  const [draft, setDraft] = useState("");
  const byId = new Map(group.rows.map((r) => [getId(r), r]));
  // Keep local order in step with new/removed rows
  const ids = group.rows.map(getId);
  const sync = order.filter((id) => byId.has(id)).concat(ids.filter((id) => !order.includes(id)));
  if (sync.join() !== order.join()) setOrder(sync);

  return (
    <section aria-label={group.label} className="flex flex-col">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className={cn("flex cursor-pointer items-center gap-2 self-start pb-2 text-lg font-medium", text[group.color])}>
        <ChevronDown aria-hidden className={cn("size-4 transition", !open && "-rotate-90")} />
        {group.label}
        <span className="text-sm font-normal text-studio-muted">
          {group.rows.length} {group.rows.length === 1 ? itemLabel.toLowerCase() : `${itemLabel.toLowerCase()}s`}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-x-auto">
            <div className="relative min-w-fit overflow-hidden rounded-l-md border border-studio-line-soft">
              <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1.5", bar[group.color])} />
              <div className="grid border-b border-studio-line-soft pl-1.5 text-sm text-studio-muted" style={{ gridTemplateColumns: template }}>
                <div className="flex h-9 items-center px-3">{itemLabel}</div>
                {columns.map((c) => (
                  <div key={c.key} className="flex h-9 items-center justify-center border-l border-studio-line-soft px-2 text-center">
                    {c.label}
                  </div>
                ))}
              </div>
              <Reorder.Group
                as="div"
                axis="y"
                values={order}
                onReorder={setOrder}
                className="flex flex-col"
              >
                {order.map((id) => {
                  const row = byId.get(id);
                  if (!row) return null;
                  return (
                    <Row
                      key={id}
                      id={id}
                      row={row}
                      title={getTitle(row)}
                      columns={columns}
                      template={template}
                      onOpen={() => onOpen(row)}
                      draggable={!!onReorder}
                      onDrop={() => onReorder?.(group.key, order)}
                    />
                  );
                })}
              </Reorder.Group>
              {onAdd && group.addable !== false && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!draft.trim()) return;
                    onAdd(group.key, draft.trim());
                    setDraft("");
                  }}
                  className="grid pl-1.5"
                  style={{ gridTemplateColumns: template }}
                >
                  <label className="flex h-9 items-center gap-2 px-3">
                    <Plus aria-hidden className="size-4 text-studio-muted" />
                    <span className="sr-only">Add an item to {group.label}</span>
                    <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`+ Add ${itemLabel.toLowerCase()}`} className="w-full bg-transparent text-sm outline-none placeholder:text-studio-muted" />
                  </label>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Row<T>({
  id,
  row,
  title,
  columns,
  template,
  onOpen,
  draggable,
  onDrop,
}: {
  id: string;
  row: T;
  title: string;
  columns: Column<T>[];
  template: string;
  onOpen: () => void;
  draggable: boolean;
  onDrop: () => void;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      as="div"
      value={id}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDrop}
      className="group/row grid border-b border-studio-line-soft bg-paper pl-1.5 text-sm transition-colors hover:bg-studio-surface"
      style={{ gridTemplateColumns: template }}
      whileDrag={{ boxShadow: "0 0 0 1px rgb(0 0 0 / 0.02), 0 2px 6px rgb(0 0 0 / 0.04), 0 4px 8px rgb(0 0 0 / 0.1)", zIndex: 10 }}
    >
      <div className="flex h-9 min-w-0 items-center gap-1 pr-2 pl-1">
        {draggable ? (
          <button
            type="button"
            aria-label={`Drag to reorder ${title}`}
            onPointerDown={(e) => controls.start(e)}
            className="flex size-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-sm text-studio-muted opacity-0 transition group-hover/row:opacity-100 focus-visible:opacity-100 active:cursor-grabbing"
          >
            <GripVertical aria-hidden className="size-4" />
          </button>
        ) : (
          <span className="w-6 shrink-0" />
        )}
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 cursor-pointer truncate text-left hover:underline">
          {title || "Untitled"}
        </button>
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Open ${title}`}
          className="flex h-6 shrink-0 cursor-pointer items-center gap-1 rounded-sm px-1.5 text-xs text-studio-muted opacity-0 transition group-hover/row:opacity-100 hover:bg-studio-hover focus-visible:opacity-100"
        >
          <Maximize2 aria-hidden className="size-3" /> Open
        </button>
      </div>
      {columns.map((c) => (
        <div key={c.key} className={cn("flex h-9 min-w-0 items-center justify-center border-l border-studio-line-soft", !c.flush && "px-2")}>
          {c.render(row)}
        </div>
      ))}
    </Reorder.Item>
  );
}

/* ---------- Kanban ---------- */

export function Kanban<T>({
  lanes,
  rows,
  laneOf,
  getId,
  onMove,
  onOpen,
  card,
}: {
  lanes: { key: string; label: string; color: StudioColor }[];
  rows: T[];
  laneOf: (row: T) => string;
  getId: (row: T) => string;
  onMove: (id: string, lane: string) => void;
  onOpen: (row: T) => void;
  card: (row: T) => React.ReactNode;
}) {
  const [over, setOver] = useState<string | null>(null);
  return (
    <div className="flex gap-3 overflow-x-auto px-6 py-6">
      {lanes.map((lane) => {
        const items = rows.filter((r) => laneOf(r) === lane.key);
        return (
          <section
            key={lane.key}
            aria-label={lane.label}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(lane.key);
            }}
            onDragLeave={() => setOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(null);
              const id = e.dataTransfer.getData("text/plain");
              if (id) onMove(id, lane.key);
            }}
            className={cn("flex w-72 shrink-0 flex-col gap-2 rounded-lg bg-studio-surface p-2 transition", over === lane.key && "ring-2 ring-studio-primary")}
          >
            <div className={cn("flex h-9 items-center justify-between rounded-md px-3 text-sm font-medium", fill[lane.color])}>
              {lane.label}
              <span className="text-xs">{items.length}</span>
            </div>
            <AnimatePresence initial={false}>
              {items.map((r) => (
                <motion.button
                  key={getId(r)}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  type="button"
                  draggable
                  onDragStartCapture={(e: React.DragEvent) => e.dataTransfer.setData("text/plain", getId(r))}
                  onClick={() => onOpen(r)}
                  className="flex cursor-grab flex-col gap-2 rounded-md border border-studio-line-soft bg-paper p-3 text-left text-sm shadow-float transition hover:border-studio-line active:cursor-grabbing"
                >
                  {card(r)}
                </motion.button>
              ))}
            </AnimatePresence>
            {items.length === 0 && <p className="px-2 py-6 text-center text-sm text-studio-muted">Drop items here</p>}
          </section>
        );
      })}
    </div>
  );
}

/* ---------- Item panel ---------- */

export function ItemPanel({
  open,
  onClose,
  title,
  onTitle,
  meta,
  save,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  onTitle?: (v: string) => void;
  meta?: React.ReactNode;
  save: SaveState;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const [draft, setDraft] = useState(title);
  const [shown, setShown] = useState(title);
  if (shown !== title) {
    setShown(title);
    setDraft(title);
  }
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div aria-hidden onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-ink/30" />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title || "Item"}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col bg-paper font-studio text-studio-text shadow-float"
          >
            <div className="flex flex-col gap-3 border-b border-studio-line-soft px-6 pt-4 pb-4">
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={onClose} aria-label="Close" className="flex size-8 cursor-pointer items-center justify-center rounded-md transition hover:bg-studio-surface">
                  <X aria-hidden className="size-4.5" />
                </button>
                <SaveStatus state={save} />
              </div>
              {onTitle ? (
                <label className="flex flex-col">
                  <span className="sr-only">Name</span>
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => draft.trim() !== title && onTitle(draft.trim())}
                    onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                    className="-mx-2 rounded-md px-2 py-1 text-2xl font-semibold outline-none hover:bg-studio-surface focus:ring-1 focus:ring-studio-primary"
                  />
                </label>
              ) : (
                <h2 className="text-2xl font-semibold">{title}</h2>
              )}
              {meta}
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
            {footer && <div className="border-t border-studio-line-soft px-6 py-3">{footer}</div>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
