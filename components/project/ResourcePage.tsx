import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProject } from "@/lib/content";
import { buttonClass, glassButtonClass } from "@/components/ui/button";
import { GlassFill } from "@/components/ui/Glass";
import { Notice } from "@/components/ui/Notice";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ReaderRoute } from "@/components/reader/ReaderRoute";
import { isPdf } from "@/lib/resource";

type Kind = "documentation" | "design-system";

const copy: Record<Kind, { title: string; what: string; covers: string[] }> = {
  documentation: {
    title: "Project documentation",
    what: "the write-up of how this project was planned, designed and handed off",
    covers: ["Goals, users and constraints", "Flows and key screens", "Decisions and why they were made", "Handoff notes for developers"],
  },
  "design-system": {
    title: "Design system",
    what: "the colors, type, spacing and components this project was built from",
    covers: ["Color and type tokens", "Spacing and layout grid", "Components and their states", "Usage guidelines"],
  },
};

/**
 * /projects/[slug]/documentation and /projects/[slug]/design-system.
 * A PDF opens in the site's reader; any other link is forwarded to.
 * Until then it explains what's coming and offers a walkthrough instead.
 */
export async function ResourcePage({ slug, kind, unlocked = false }: { slug: string; kind: Kind; unlocked?: boolean }) {
  const project = await getProject(slug);
  if (!project) notFound();
  // NDA: only the unlocked route (see proxy.ts) passes `unlocked`
  if (project.locked && !unlocked) redirect(`/projects/${slug}`);
  const url = kind === "documentation" ? project.docsUrl : project.designSystemUrl;
  const c = copy[kind];
  if (isPdf(url)) {
    return (
      <main className="mx-auto flex max-w-site flex-col gap-6 px-gutter pt-8 pb-20">
        <Link href={`/projects/${project.slug}`} transitionTypes={["nav-back"]} className={glassButtonClass("secondary", "self-start")}><GlassFill variant="secondary" />
          <ArrowLeft aria-hidden className="size-4" /> Back to {project.name}
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{project.name} · {c.title}</h1>
        <ReaderRoute src={url} title={`${project.name} · ${c.title}`} backHref={`/projects/${project.slug}`} />
      </main>
    );
  }
  if (url) redirect(url);

  return (
    <main className="mx-auto flex max-w-site flex-col gap-8 px-gutter pt-8 pb-20">
      <Link href={`/projects/${project.slug}`} transitionTypes={["nav-back"]} className={glassButtonClass("secondary", "self-start")}><GlassFill variant="secondary" />
        <ArrowLeft aria-hidden className="size-4" /> Back to {project.name}
      </Link>
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium text-muted">{project.name}</span>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{c.title}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={project.status} />
          <span className="text-muted">{project.years} · {project.platform}</span>
        </div>
      </div>
      <Notice tone="info" className="max-w-2xl">
        The public version of {c.what} is being prepared. Want to see it sooner? I’m happy to walk you through it on a call.
      </Notice>
      <section aria-labelledby="covers-title" className="flex max-w-2xl flex-col gap-4 rounded-card border border-line-strong p-6">
        <h2 id="covers-title" className="text-lg font-semibold">What it will cover</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {c.covers.map((x) => (
            <li key={x} className="flex items-center gap-3 text-sm">
              <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-ink" /> {x}
            </li>
          ))}
        </ul>
      </section>
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/contact" className={glassButtonClass("primary")}><GlassFill variant="primary" />Ask for a walkthrough</Link>
        <Link href={`/projects/${project.slug}`} transitionTypes={["nav-back"]} className={buttonClass("tertiary")}>
          Read the {project.name} diary
        </Link>
      </div>
    </main>
  );
}
