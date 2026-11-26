import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { ArrowLeft } from "lucide-react";
import { getProject, getProjects, getStampsFor } from "@/lib/content";
import { glassButtonClass } from "@/components/ui/button";
import { GlassFill } from "@/components/ui/Glass";
import { StatusBadge, statusInfo, toneClass } from "@/components/ui/StatusBadge";
import { Shot } from "@/components/project/Shot";
import { TopActions, WorkActions } from "@/components/project/ProjectActions";
import { Passport } from "@/components/stamps/Passport";
import { cn } from "@/lib/cn";
import { PhotoTour } from "@/components/project/PhotoTour";
import { MobileWorkBar } from "@/components/project/MobileWorkBar";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { StatBar } from "@/components/motion/StatBar";
import { DiaryEntry } from "@/components/project/DiaryEntry";
import { LockGate } from "@/components/project/LockGate";

const slide = {
  enter: { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" },
  exit: { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" },
} as const;

const SITE = "https://www.chrispaynaganan.com";

/**
 * The project page. A locked (NDA) project shows only its title and a password box unless
 * `unlocked` is set, which only the dynamic /projects/[slug]/unlocked route does after checking the cookie.
 */
export async function ProjectView({ slug, unlocked = false }: { slug: string; unlocked?: boolean }) {
  const project = await getProject(slug);
  if (!project) notFound();
  const locked = !!project.locked && !unlocked;

  const [all, stamps] = await Promise.all([getProjects(), getStampsFor(project)]);
  const i = all.findIndex((p) => p.slug === slug);
  const prev = all[(i - 1 + all.length) % all.length];
  const next = all[(i + 1) % all.length];
  const url = `${SITE}/projects/${project.slug}`;
  const subtitle = `${project.kind} · ${project.years}`;
  const status = statusInfo[project.status];
  const [hero, ...rest] = project.screenshots;
  // The grid beside the hero holds four tiles. Projects with five or more screenshots fill it;
  // otherwise a "Figma file" placeholder takes the next spot.
  const tiles = rest.slice(0, 4);
  const needsFigma = tiles.length < 4;
  const figmaShot = { label: "Figma file" };

  return (
    <ViewTransition enter={slide.enter} exit={slide.exit} default="none">
    <main className="mx-auto flex max-w-site flex-col gap-6 px-gutter pt-6 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" transitionTypes={["nav-back"]} className={glassButtonClass("secondary")}><GlassFill variant="secondary" />
          <ArrowLeft aria-hidden className="size-4" /> All projects
        </Link>
        <TopActions slug={project.slug} name={project.name} subtitle={subtitle} url={url} />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium tracking-tight">
          {project.name}: {project.kind}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <StatusBadge status={project.status} />
          <span className="font-medium">{project.years}</span>
          <span aria-hidden className="text-muted">·</span>
          <span className="text-muted">{project.category}</span>
        </div>

      </div>

      {locked ? (
        <>
          <LockGate slug={project.slug} name={project.name} />
          <div className="flex flex-wrap justify-between gap-3 pt-1">
            <Link href={`/projects/${prev.slug}`} transitionTypes={["nav-back"]} className={glassButtonClass("secondary")}><GlassFill variant="secondary" />← {prev.name}</Link>
            <Link href={`/projects/${next.slug}`} transitionTypes={["nav-forward"]} className={glassButtonClass("secondary")}><GlassFill variant="secondary" />{next.name} →</Link>
          </div>
        </>
      ) : (
      <>
      <section aria-label="Screenshots" className="relative grid grid-cols-2 gap-2 overflow-hidden rounded-card md:grid-cols-4">
        {hero && (
          <ViewTransition name={`shot-${project.slug}`} share="morph" default="none">
            <Shot shot={{ ...hero, label: "Hero screenshot" }} name={project.name} big eager highPriority className="col-span-2 h-72 md:row-span-2 md:h-full" />
          </ViewTransition>
        )}
        {tiles.map((s, n) => (
          <Reveal key={s.label} delay={0.15 + n * 0.08} y={10} className="hidden md:block">
            <Shot shot={s} className="h-52 transition duration-500 ease-soft hover:brightness-95" />
          </Reveal>
        ))}
        {needsFigma && (
          <Reveal delay={0.15 + tiles.length * 0.08} y={10} className="hidden md:block">
            <Shot shot={figmaShot} className="h-52" />
          </Reveal>
        )}
        <PhotoTour name={project.name} shots={needsFigma ? [...project.screenshots, figmaShot] : project.screenshots} />
      </section>

      <div className="flex flex-wrap items-start gap-14 pt-2">
        <div className="flex min-w-0 flex-1 basis-lg flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-line pb-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold">Designed by Chris Paynaganan</h2>
              <span>{project.role}</span>
            </div>
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-ink font-medium text-paper">CP</span>
          </div>

          <ul className="flex flex-col gap-4.5 border-b border-line py-6">
            {project.facts.map((f) => (
              <li key={f.label} className="flex items-start gap-4">
                <span aria-hidden className="mt-0.5 size-6 shrink-0 rounded-md border-2 border-ink" />
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium">{f.label}</span>
                  <span className="text-sm text-muted">{f.value}</span>
                </span>
              </li>
            ))}
          </ul>

          {project.stats.length > 0 && (
            <div className="grid grid-cols-3 gap-3 border-b border-line py-6">
              {project.stats.map((s) => (
                <div key={s.label} className="flex flex-col gap-2 rounded-card border border-line-strong p-4">
                  <span className="text-3xl font-semibold tracking-tight"><CountUp value={s.value} /></span>
                  <span className="text-sm text-muted">{s.label}</span>
                  <StatBar delay={0.2} />
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col pt-2">
            {project.entries.map((e, n) => (
              <Reveal key={e.stage} delay={n === 0 ? 0 : 0.05}>
                <DiaryEntry entry={e} projectName={project.name} />
              </Reveal>
            ))}
          </div>

          {stamps.length > 0 && (
            <section aria-labelledby="trip-stamps" className="flex flex-col gap-5 border-b border-line py-8">
              <h2 id="trip-stamps" className="text-xl font-semibold">Stamps from this trip</h2>
              <div className="max-w-md">
                <Passport stamps={stamps} compact />
              </div>
            </section>
          )}

          <div className="flex flex-wrap justify-between gap-3 pt-7">
            <Link href={`/projects/${prev.slug}`} transitionTypes={["nav-back"]} className={glassButtonClass("secondary")}><GlassFill variant="secondary" />← {prev.name}</Link>
            <Link href={`/projects/${next.slug}`} transitionTypes={["nav-forward"]} className={glassButtonClass("secondary")}><GlassFill variant="secondary" />{next.name} →</Link>
          </div>
        </div>

        <aside
          id="explore"
          aria-labelledby="work-title"
          className="flex w-full scroll-mt-20 flex-col gap-3.5 rounded-card border border-line-strong p-6 shadow-float md:sticky md:top-20 md:w-80 md:shrink-0"
        >
          <div className="flex flex-col gap-0.5">
            <h2 id="work-title" className="text-xl font-semibold">Explore the work</h2>
            <span className="text-sm text-muted">
              {project.years} · {project.platform}
            </span>
          </div>
          <p role="note" className={cn("rounded-xl px-3.5 py-3 text-sm", toneClass[status.tone])}>
            {status.note}
          </p>
          <WorkActions slug={project.slug} name={project.name} subtitle={subtitle} url={url} liveUrl={project.liveUrl} previewUrl={project.previewUrl} previewMobileUrl={project.previewMobileUrl} docsUrl={project.docsUrl} designSystemUrl={project.designSystemUrl} />
        </aside>
      </div>
      <MobileWorkBar years={project.years} status={status.label} />
      </>
      )}
    </main>
    </ViewTransition>
  );
}
