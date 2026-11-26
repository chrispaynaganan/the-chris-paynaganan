"use client";

import Link from "next/link";
import { useState } from "react";
import { Share } from "lucide-react";
import { buttonClass, glassButtonClass } from "@/components/ui/button";
import { GlassFill } from "@/components/ui/Glass";
import { ShareDialog } from "./ShareDialog";
import { ReaderButton } from "@/components/reader/ReaderButton";
import { isPdf } from "@/lib/resource";

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
  previewUrl,
  previewMobileUrl,
  docsUrl,
  designSystemUrl,
}: Props & { liveUrl?: string; previewUrl?: string; previewMobileUrl?: string; docsUrl?: string; designSystemUrl?: string }) {
  const share = useShare();
  return (
    <div className="flex flex-col gap-3">
      {isPdf(docsUrl) ? (
        <ReaderButton src={docsUrl} title={`${name} · Project documentation`} className={glassButtonClass("primary")}><GlassFill variant="primary" />Project documentation</ReaderButton>
      ) : (
        <Link href={`/projects/${slug}/documentation`} className={glassButtonClass("primary")}><GlassFill variant="primary" />Project documentation</Link>
      )}
      {isPdf(designSystemUrl) ? (
        <ReaderButton src={designSystemUrl} title={`${name} · Design system`} className={glassButtonClass("secondary")}><GlassFill variant="secondary" />Design system</ReaderButton>
      ) : (
        <Link href={`/projects/${slug}/design-system`} className={glassButtonClass("secondary")}><GlassFill variant="secondary" />Design system</Link>
      )}
      {liveUrl && (
        <a href={liveUrl} target="_blank" rel="noopener" className={glassButtonClass("secondary")}><GlassFill variant="secondary" />Visit live site</a>
      )}
      {!liveUrl && previewUrl && (
        <a href={previewUrl} target="_blank" rel="noopener" className={glassButtonClass("secondary")}><GlassFill variant="secondary" />
          {previewMobileUrl ? "Try the web preview" : "Try the preview"}
        </a>
      )}
      {!liveUrl && previewMobileUrl && (
        <a href={previewMobileUrl} target="_blank" rel="noopener" className={glassButtonClass("secondary")}><GlassFill variant="secondary" />
          {previewUrl ? "Try the mobile preview" : "Try the preview"}
        </a>
      )}
      <button type="button" onClick={share.openShare} className={buttonClass("tertiary", "self-center")}>
        Share this project
      </button>
      <ShareDialog open={share.open} onClose={share.close} url={url} title={name} subtitle={subtitle} />
    </div>
  );
}
