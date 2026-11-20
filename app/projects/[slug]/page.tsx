import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProject, getProjects, getStampsFor } from "@/lib/content";
import { buttonClass } from "@/components/ui/button";
import { StatusBadge, statusInfo, toneClass } from "@/components/ui/StatusBadge";
import { Shot } from "@/components/project/Shot";
import { TopActions, WorkActions } from "@/components/project/ProjectActions";
import { Passport } from "@/components/stamps/Passport";
import { cn } from "@/lib/cn";

const SITE = "https://www.chrispaynaganan.com";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) return {};
  return { title: `${p.name}: ${p.kind}`, description: p.entries[0]?.body };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const [all, stamps] = await Promise.all([getProjects(), getStampsFor(project)]);
  const i = all.findIndex((p) => p.slug === slug);
  const prev = all[(i - 1 + all.length) % all.length];
  const next = all[(i + 1) % all.length];
  const url = `${SITE}/projects/${project.slug}`;
  const subtitle = `${project.kind} · ${project.years}`;
  const status = statusInfo[project.status];
  const [hero, ...rest] = project.screenshots;

  return (
    <main className="mx-auto flex max-w-6xl animate-fade-in flex-col gap-6 px-6 pt-6 pb-20 md:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className={buttonClass("secondary", "min-h-11 px-3.5 text-sm")}>
          <ArrowLeft aria-hidden className="size-4" /> All projects
        </Link>
        <TopActions slug={project.slug} name={project.name} subtitle={subtitle} url={url} />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {project.name}: {project.kind}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <StatusBadge status={project.status} />
          <span className="font-semibold">{project.years}</span>
          <span aria-hidden className="text-muted">·</span>
          <span className="text-muted">{project.category}</span>
        </div>
      </div>

      <section aria-label="Screenshots" className="grid grid-cols-2 gap-2 overflow-hidden rounded-2xl md:grid-cols-4">
        {hero && <Shot shot={{ ...hero, label: "Hero screenshot" }} name={project.name} big className="col-span-2 h-72 md:row-span-2 md:h-full" />}
        {rest.map((s) => (
          <Shot key={s.label} shot={s} className="hidden h-52 items-start justify-end md:flex" />
        ))}
        <Shot shot={{ label: "Figma file" }} className="hidden h-52 md:flex" />
      </section>

      <div className="flex flex-wrap items-start gap-14 pt-2">
        <div className="flex min-w-0 flex-1 basis-lg flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-line pb-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold">Designed by Chris Paynaganan</h2>
              <span>{project.role}</span>
            </div>
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-ink font-extrabold text-paper">CP</span>
          </div>

          <ul className="flex flex-col gap-4.5 border-b border-line py-6">
            {project.facts.map((f) => (
              <li key={f.label} className="flex items-start gap-4">
                <span aria-hidden className="mt-0.5 size-6 shrink-0 rounded-md border-2 border-ink" />
                <span className="flex flex-col gap-0.5">
                  <span className="font-semibold">{f.label}</span>
                  <span className="text-sm leading-normal text-muted">{f.value}</span>
                </span>
              </li>
            ))}
          </ul>

          {project.stats.length > 0 && (
            <div className="grid grid-cols-3 gap-3 border-b border-line py-6">
              {project.stats.map((s) => (
                <div key={s.label} className="flex flex-col gap-1 rounded-xl border border-line-strong p-4">
                  <span className="text-3xl font-extrabold tracking-tight">{s.value}</span>
                  <span className="text-sm leading-snug text-muted">{s.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col pt-2">
            {project.entries.map((e, n) => (
              <article
                key={e.stage}
                className="flex animate-fade-up flex-col gap-2.5 border-b border-line py-6"
                style={{ animationDelay: `${n * 70}ms` }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="text-xl font-bold">{e.label}</h3>
                  <span className="font-diary text-muted italic">{e.date}</span>
                </div>
                <p className="font-diary text-xl leading-relaxed">{e.body}</p>
              </article>
            ))}
          </div>

          {stamps.length > 0 && (
            <section aria-labelledby="trip-stamps" className="flex flex-col gap-5 border-b border-line py-8">
              <h2 id="trip-stamps" className="text-xl font-bold">Stamps from this trip</h2>
              <div className="max-w-md">
                <Passport stamps={stamps} compact />
              </div>
            </section>
          )}

          <div className="flex flex-wrap justify-between gap-3 pt-7">
            <Link href={`/projects/${prev.slug}`} className={buttonClass("secondary", "text-sm")}>← {prev.name}</Link>
            <Link href={`/projects/${next.slug}`} className={buttonClass("secondary", "text-sm")}>{next.name} →</Link>
          </div>
        </div>

        <aside
          aria-labelledby="work-title"
          className="flex w-full flex-col gap-3.5 rounded-2xl border border-line-strong p-6 shadow-card md:sticky md:top-28 md:w-80 md:shrink-0"
        >
          <div className="flex flex-col gap-0.5">
            <h2 id="work-title" className="text-xl font-bold">Explore the work</h2>
            <span className="text-sm text-muted">
              {project.years} · {project.platform}
            </span>
          </div>
          <p role="note" className={cn("rounded-xl px-3.5 py-3 text-sm leading-snug", toneClass[status.tone])}>
            {status.note}
          </p>
          <WorkActions
            name={project.name}
            subtitle={subtitle}
            url={url}
            docsUrl={project.docsUrl}
            designSystemUrl={project.designSystemUrl}
            liveUrl={project.liveUrl}
          />
        </aside>
      </div>
    </main>
  );
}
