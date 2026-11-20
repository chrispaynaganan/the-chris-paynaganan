"use client";

import Link from "next/link";
import { useState } from "react";
import { Share } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
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

/** Share, top right of the project page. */
export function TopActions({ name, subtitle, url }: Props) {
  const share = useShare();
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={share.openShare} className={buttonClass("tertiary", "text-sm")}>
        <Share aria-hidden className="size-4" /> Share
      </button>
      <ShareDialog open={share.open} onClose={share.close} url={url} title={name} subtitle={subtitle} />
    </div>
  );
}

/** The buttons in the sticky "Explore the work" card. */
export function WorkActions({
  slug,
  name,
  subtitle,
  url,
  liveUrl,
}: Props & { liveUrl?: string }) {
  const share = useShare();
  return (
    <div className="flex flex-col gap-3">
      <Link href={`/projects/${slug}/documentation`} className={buttonClass("primary")}>Project documentation</Link>
      <Link href={`/projects/${slug}/design-system`} className={buttonClass("secondary")}>Design system</Link>
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
