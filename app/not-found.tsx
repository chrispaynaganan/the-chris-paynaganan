import Link from "next/link";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { glassButtonClass } from "@/components/ui/button";
import { GlassFill } from "@/components/ui/Glass";

export default function NotFound() {
  return (
    <SiteChrome>
    <main className="mx-auto flex max-w-site flex-col items-start gap-4 px-gutter pt-20 pb-24">
      <span className="text-xl text-muted">Dear diary,</span>
      <h1 className="text-4xl font-semibold tracking-tight">This page isn’t on the map.</h1>
      <p className="text-muted">The link may be old, or the page moved.</p>
      <Link href="/" className={glassButtonClass("primary")}><GlassFill variant="primary" />Back to projects</Link>
    </main>
    </SiteChrome>
  );
}
