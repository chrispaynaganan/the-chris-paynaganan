"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";

export function ShareDialog({
  open,
  onClose,
  url,
  title,
  subtitle,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
  title: string;
  subtitle: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const toast = useToast();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      onClose();
      toast("ok", "Link copied");
    } catch {
      toast("error", "Couldn’t copy. Select the link and copy it.");
    }
  };

  const enc = encodeURIComponent(url);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="share-title"
      className="m-auto w-full max-w-lg animate-pop rounded-2xl bg-paper p-6 text-ink shadow-dialog backdrop:animate-fade-in backdrop:bg-ink/45"
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 id="share-title" className="text-xl font-bold">Share this project</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex size-11 cursor-pointer items-center justify-center rounded-full transition hover:bg-surface">
            <X aria-hidden className="size-4.5" />
          </button>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="size-16 shrink-0 rounded-xl bg-placeholder" />
          <div className="flex flex-col">
            <span className="font-bold">{title}</span>
            <span className="text-sm text-muted">{subtitle}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="share-link" className="text-sm font-semibold">Link</label>
          <input
            id="share-link"
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="min-h-11 rounded-xl border border-line-strong px-3 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <button type="button" onClick={copy} className={buttonClass("primary", "col-span-2")}>
            Copy link
          </button>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc}`} target="_blank" rel="noopener" className={buttonClass("secondary")}>
            LinkedIn
          </a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${enc}`} target="_blank" rel="noopener" className={buttonClass("secondary")}>
            Facebook
          </a>
          <a
            href={`mailto:?subject=${encodeURIComponent(`${title} by Chris Paynaganan`)}&body=${enc}`}
            className={buttonClass("tertiary", "col-span-2 justify-self-center")}
          >
            Send by email
          </a>
        </div>
      </div>
    </dialog>
  );
}
