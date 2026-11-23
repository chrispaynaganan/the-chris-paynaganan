import Link from "next/link";
import { ViewTransition } from "react";
import { categories, getPassport, getProjects, getSite } from "@/lib/content";
import { ProjectExplorer } from "@/components/home/ProjectExplorer";
import { Niches } from "@/components/home/Niches";
import { Reveal } from "@/components/motion/Reveal";
import { buttonClass } from "@/components/ui/button";

const slide = {
  enter: { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" },
  exit: { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" },
} as const;

export default async function HomePage() {
  const [projects, passport, site] = await Promise.all([getProjects(), getPassport(), getSite()]);
  return (
    <ViewTransition enter={slide.enter} exit={slide.exit} default="none">
      <main className="mx-auto flex max-w-site flex-col gap-16 px-gutter pt-8 pb-20">
        <ProjectExplorer
          projects={projects}
          categories={categories}
          intro={
            // Not wrapped in Reveal: the headline is the first thing people see, so it shows
            // straight away instead of waiting for JavaScript to fade it in.
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{site.heroLine}</h1>
              <p className="text-muted">
                {projects.length} projects, written up like diary entries. Healthcare, maritime, coaching, voice and e-commerce.
              </p>
            </div>
          }
        />

        <div className="border-t border-line pt-12">
          <Niches stamps={passport} />
        </div>

        <Reveal>
          <section aria-labelledby="host-teaser" className="flex flex-wrap items-center gap-8 border-t border-line pt-12">
            <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-placeholder text-xs text-muted">[Photo]</div>
            <div className="flex min-w-0 flex-1 basis-96 flex-col gap-2">
              <h2 id="host-teaser" className="text-xl font-semibold">Meet your host</h2>
              <p className="max-w-3xl text-xl">{site.hostTeaser}</p>
              <Link href="/about" className={buttonClass("tertiary", "self-start")}>
                Read my story
              </Link>
            </div>
          </section>
        </Reveal>
      </main>
    </ViewTransition>
  );
}
