"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, FileText, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/cn";
import { studioClient } from "@/lib/supabase/browser";

const control = "w-full rounded-md border border-studio-line bg-paper px-3 text-sm outline-none transition hover:border-studio-muted focus:border-studio-primary focus:ring-1 focus:ring-studio-primary";

/** Keeps a local draft and resets it when the saved value changes underneath (another field saved). */
function useDraft<T>(value: T) {
  const [draft, setDraft] = useState(value);
  const [seen, setSeen] = useState(value);
  if (JSON.stringify(seen) !== JSON.stringify(value)) {
    setSeen(value);
    setDraft(value);
  }
  return [draft, setDraft] as const;
}

export function Section({ title, children, hint }: { title: string; children: React.ReactNode; hint?: string }) {
  return (
    <section className="flex flex-col gap-4 border-b border-studio-line-soft pb-6 last:border-b-0">
      <div className="flex flex-col gap-0.5">
        <h3 className="font-semibold">{title}</h3>
        {hint && <p className="text-sm text-studio-muted">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export function TextField({
  label,
  value,
  onCommit,
  multiline,
  rows = 3,
  type = "text",
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onCommit: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  type?: "text" | "url" | "email" | "number";
  placeholder?: string;
  hint?: string;
}) {
  const id = useId();
  const [draft, setDraft] = useDraft(value ?? "");
  const commit = () => draft !== (value ?? "") && onCommit(draft);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-studio-muted">{label}</label>
      {multiline ? (
        <textarea id={id} rows={rows} value={draft} placeholder={placeholder} onChange={(e) => setDraft(e.target.value)} onBlur={commit} className={cn(control, "resize-y py-2")} />
      ) : (
        <input id={id} type={type} value={draft} placeholder={placeholder} onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} className={cn(control, "h-9")} />
      )}
      {hint && <p className="text-xs text-studio-muted">{hint}</p>}
    </div>
  );
}

export function Toggle({ label, value, onChange, hint }: { label: string; value: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col">
        <span className="text-sm">{label}</span>
        {hint && <span className="text-xs text-studio-muted">{hint}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        className={cn("relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition", value ? "bg-studio-green" : "bg-studio-grey")}
      >
        <span className={cn("absolute top-0.5 size-5 rounded-full bg-paper shadow-float transition-all", value ? "left-5.5" : "left-0.5")} />
      </button>
    </div>
  );
}

export function SelectField({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-studio-muted">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={cn(control, "h-9")}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export function ChipsField({ label, value, options, onChange, hint }: { label: string; value: string[]; options: { value: string; label: string }[]; onChange: (v: string[]) => void; hint?: string }) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="pb-1.5 text-sm text-studio-muted">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = value.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])}
              className={cn("h-7 cursor-pointer rounded-full border px-3 text-sm transition", on ? "border-studio-primary bg-studio-selected text-studio-primary" : "border-studio-line hover:border-studio-muted")}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {hint && <p className="text-xs text-studio-muted">{hint}</p>}
    </fieldset>
  );
}

/** A list of short strings, one per line. */
export function LinesField({ label, value, onCommit, hint, rows = 5 }: { label: string; value: string[]; onCommit: (v: string[]) => void; hint?: string; rows?: number }) {
  return (
    <TextField
      label={label}
      multiline
      rows={rows}
      value={(value ?? []).join("\n")}
      hint={hint ?? "One per line."}
      onCommit={(v) => onCommit(v.split("\n").map((x) => x.trim()).filter(Boolean))}
    />
  );
}

type SubField = { key: string; label: string; multiline?: boolean; rows?: number; type?: "text" | "url" };

/** A list of small records (facts, stats, diary entries…): edit, add, remove, reorder. */
export function Repeater({
  label,
  items,
  fields,
  onCommit,
  addLabel = "Add",
  blank,
  itemTitle,
}: {
  label: string;
  items: Record<string, unknown>[];
  fields: SubField[];
  onCommit: (v: Record<string, unknown>[]) => void;
  addLabel?: string;
  blank: Record<string, unknown>;
  itemTitle?: (item: Record<string, unknown>, i: number) => string;
}) {
  const list = items ?? [];
  const set = (i: number, key: string, v: string) => onCommit(list.map((it, j) => (j === i ? { ...it, [key]: v } : it)));
  const move = (i: number, d: number) => {
    const next = [...list];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    onCommit(next);
  };
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm text-studio-muted">{label}</span>
      {list.map((it, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border border-studio-line-soft bg-studio-surface p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{itemTitle ? itemTitle(it, i) : `${i + 1}`}</span>
            <div className="flex gap-1">
              <IconBtn label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="size-3.5" /></IconBtn>
              <IconBtn label="Move down" disabled={i === list.length - 1} onClick={() => move(i, 1)}><ArrowDown className="size-3.5" /></IconBtn>
              <IconBtn label="Remove" onClick={() => onCommit(list.filter((_, j) => j !== i))}><Trash2 className="size-3.5" /></IconBtn>
            </div>
          </div>
          {fields.map((f) => (
            <TextField key={f.key} label={f.label} multiline={f.multiline} rows={f.rows} type={f.type} value={String(it[f.key] ?? "")} onCommit={(v) => set(i, f.key, v)} />
          ))}
        </div>
      ))}
      <button type="button" onClick={() => onCommit([...list, { ...blank }])} className="h-8 cursor-pointer self-start rounded-md border border-dashed border-studio-line px-3 text-sm text-studio-muted transition hover:border-studio-primary hover:text-studio-primary">
        + {addLabel}
      </button>
    </div>
  );
}

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className="flex size-7 cursor-pointer items-center justify-center rounded-md text-studio-muted transition hover:bg-paper hover:text-studio-text disabled:cursor-not-allowed disabled:opacity-30">
      {children}
    </button>
  );
}

/** Screenshots: upload to Supabase Storage, label, reorder, remove. */
export function ImagesField({
  label,
  items,
  folder,
  onCommit,
  hint,
}: {
  label: string;
  items: { label: string; src?: string }[];
  folder: string;
  onCommit: (v: { label: string; src?: string }[]) => void;
  hint?: string;
}) {
  const list = items ?? [];
  const input = useRef<HTMLInputElement>(null);
  const [target, setTarget] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file: File) => {
    setBusy(true);
    setError("");
    const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    const path = `${folder}/${Date.now()}-${safe}`;
    const storage = studioClient().storage.from("studio-media");
    const { error: err } = await storage.upload(path, file, { cacheControl: "31536000", upsert: false });
    setBusy(false);
    if (err) return setError("Upload failed. Check the file and try again.");
    const src = storage.getPublicUrl(path).data.publicUrl;
    if (target === null) onCommit([...list, { label: file.name.replace(/\.[^.]+$/, ""), src }]);
    else onCommit(list.map((it, j) => (j === target ? { ...it, src } : it)));
    setTarget(null);
  };

  const move = (i: number, d: number) => {
    const next = [...list];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    onCommit(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm text-studio-muted">{label}</span>
        {hint && <span className="text-xs text-studio-muted">{hint}</span>}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void upload(f);
        }}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {list.map((it, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg border border-studio-line-soft p-2">
            <button
              type="button"
              onClick={() => {
                setTarget(i);
                input.current?.click();
              }}
              className="relative flex aspect-4/3 cursor-pointer items-center justify-center overflow-hidden rounded-md bg-studio-surface text-xs text-studio-muted transition hover:ring-2 hover:ring-studio-primary"
              aria-label={it.src ? `Replace the ${it.label} image` : `Upload an image for ${it.label}`}
            >
              {it.src ? <Image src={it.src} alt="" fill sizes="200px" className="object-cover" /> : <span className="flex flex-col items-center gap-1"><ImagePlus aria-hidden className="size-5" /> Upload</span>}
            </button>
            <TextField label="Label" value={it.label} onCommit={(v) => onCommit(list.map((x, j) => (j === i ? { ...x, label: v } : x)))} />
            <div className="flex justify-end gap-1">
              <IconBtn label="Move earlier" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="size-3.5" /></IconBtn>
              <IconBtn label="Move later" disabled={i === list.length - 1} onClick={() => move(i, 1)}><ArrowDown className="size-3.5" /></IconBtn>
              <IconBtn label="Remove" onClick={() => onCommit(list.filter((_, j) => j !== i))}><Trash2 className="size-3.5" /></IconBtn>
            </div>
          </div>
        ))}
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setTarget(null);
            input.current?.click();
          }}
          className="flex aspect-4/3 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-studio-line text-sm text-studio-muted transition hover:border-studio-primary hover:text-studio-primary"
        >
          {busy ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <ImagePlus aria-hidden className="size-5" />}
          {busy ? "Uploading…" : "Add screenshot"}
        </button>
      </div>
      {error && <p role="alert" className="text-sm text-studio-red">{error}</p>}
    </div>
  );
}

/** Two-step delete, so nothing goes with one stray click. */
export function DeleteButton({ label, onConfirm }: { label: string; onConfirm: () => void }) {
  const [armed, setArmed] = useState(false);
  return armed ? (
    <div className="flex items-center gap-2">
      <span className="text-sm">Delete for good?</span>
      <button type="button" onClick={onConfirm} className="h-8 cursor-pointer rounded-md bg-studio-red px-3 text-sm font-medium text-paper">Delete</button>
      <button type="button" onClick={() => setArmed(false)} className="h-8 cursor-pointer rounded-md px-3 text-sm hover:bg-studio-surface">Cancel</button>
    </div>
  ) : (
    <button type="button" onClick={() => setArmed(true)} className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2 text-sm text-studio-red transition hover:bg-error-bg">
      <Trash2 aria-hidden className="size-4" /> {label}
    </button>
  );
}


/**
 * A project document (PDF): upload it here, or paste a link. Uploads go to the private
 * "studio-files" bucket and open through /files/<slug>/<file>, which respects the NDA lock.
 */
export function PdfField({
  label,
  value,
  slug,
  kind,
  onCommit,
  hint,
}: {
  label: string;
  value: string;
  slug: string;
  kind: string;
  onCommit: (v: string) => void;
  hint?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const uploaded = value.startsWith(`/files/`);

  const upload = async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return setError("Choose a PDF file.");
    if (file.size > 50 * 1024 * 1024) return setError("That PDF is over 50 MB.");
    setBusy(true);
    setError("");
    const name = `${kind}-${Date.now()}.pdf`;
    const { error: err } = await studioClient().storage.from("studio-files").upload(`${slug}/${name}`, file, { contentType: "application/pdf", upsert: false });
    setBusy(false);
    if (err) return setError(/bucket/i.test(err.message) ? "Run supabase/0014_studio_files.sql in Supabase first." : "Upload failed. Check the file and try again.");
    onCommit(`/files/${slug}/${name}`);
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={input}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void upload(f);
        }}
      />
      {uploaded ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-studio-muted">{label}</span>
          <div className="flex items-center gap-3 rounded-md border border-studio-line bg-paper px-3 py-2">
            <FileText aria-hidden className="size-5 shrink-0 text-studio-red" />
            <span className="min-w-0 flex-1 truncate text-sm">{value.split("/").pop()}</span>
            <a href={value} target="_blank" rel="noopener" aria-label={`Open ${label}`} className="flex size-7 items-center justify-center rounded text-studio-muted hover:bg-studio-hover hover:text-studio-text">
              <ExternalLink aria-hidden className="size-4" />
            </a>
            <IconBtn label={`Remove ${label}`} onClick={() => onCommit("")}>
              <Trash2 className="size-3.5" />
            </IconBtn>
          </div>
        </div>
      ) : (
        <TextField label={label} type="url" value={value} onCommit={onCommit} placeholder="Paste a link, or upload a PDF below" />
      )}
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-studio-line text-sm text-studio-muted transition hover:border-studio-primary hover:text-studio-primary disabled:cursor-wait"
      >
        {busy ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Upload aria-hidden className="size-4" />}
        {busy ? "Uploading…" : uploaded ? "Replace PDF" : "Upload PDF"}
      </button>
      {error ? <p role="alert" className="text-sm text-studio-red">{error}</p> : hint && <p className="text-xs text-studio-muted">{hint}</p>}
    </div>
  );
}
