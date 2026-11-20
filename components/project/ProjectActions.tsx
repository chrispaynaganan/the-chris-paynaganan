"use client";

import { useState } from "react";
import { Heart, Share } from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonClass } from "@/components/ui/button";
import { useSaved } from "@/components/ui/SavedProvider";
import { useToast } from "@/components/ui/Toast";
import { ShareDialog } from "./ShareDialog";

type Props = {
  slug: string;
  name: string;
  subtitle: string;
  url: string;
};

function useShare() {
  const [open, setOpen] = useState(false);
  return { open, openShare: () => setOpen(true), close: () => setOpen(false) };
}

/** Share + Save, top right of the project page. */
export function TopActions({ slug, name, subtitle, url }: Props) {
  const share = useShare();
  const { saved, toggle } = useSaved();
  const toast = useToast();
  const isSaved = saved.includes(slug);
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={share.openShare} className={buttonClass("tertiary", "text-sm")}>
        <Share aria-hidden className="size-4" /> Share
      </button>
      <button
        type="button"
        aria-pressed={isSaved}
        onClick={() => toast("ok", toggle(slug) ? `Saved ${name}` : "Removed from saved")}
        className={buttonClass("tertiary", "text-sm")}
      >
        <Heart aria-hidden className={cn("size-4 stroke-ink", isSaved ? "animate-heart fill-ink" : "fill-none")} />
        {isSaved ? "Saved" : "Save"}
      </button>
      <ShareDialog open={share.open} onClose={share.close} url={url} title={name} subtitle={subtitle} />
    </div>
  );
}

/** The buttons in the sticky "Explore the work" card. */
export function WorkActions({
  name,
  subtitle,
  url,
  docsUrl,
  designSystemUrl,
  liveUrl,
}: Omit<Props, "slug"> & { docsUrl?: string; designSystemUrl?: string; liveUrl?: string }) {
  const share = useShare();
  const toast = useToast();
  const soon = (what: string) => toast("info", `The ${name} ${what} link is coming soon.`);

  return (
    <div className="flex flex-col gap-3">
      {docsUrl ? (
        <a href={docsUrl} target="_blank" rel="noopener" className={buttonClass("primary")}>Project documentation</a>
      ) : (
        <button type="button" onClick={() => soon("documentation")} className={buttonClass("primary")}>Project documentation</button>
      )}
      {designSystemUrl ? (
        <a href={designSystemUrl} target="_blank" rel="noopener" className={buttonClass("secondary")}>Design system</a>
      ) : (
        <button type="button" onClick={() => soon("design system")} className={buttonClass("secondary")}>Design system</button>
      )}
      {liveUrl && (
        <a href={liveUrl} target="_blank" rel="noopener" className={buttonClass("secondary")}>Visit live site</a>
      )}
      <button type="button" onClick={share.openShare} className={buttonClass("tertiary", "self-center")}>
        Share this project
      </button>
      <ShareDialog open={share.open} onClose={share.close} url={url} title={name} subtitle={subtitle} />
    </div>
  );
}
