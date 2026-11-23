import Link from "next/link";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { getPassport, getProjects, getSite } from "@/lib/content";
import { buttonClass } from "@/components/ui/button";
import { Notice } from "@/components/ui/Notice";
import { Reveal } from "@/components/motion/Reveal";
import { PassportSection } from "@/components/stamps/PassportSection";

export const metadata: Metadata = { title: "About Chris" };

const chip = "rounded-full border border-line-strong px-3.5 py-2 text-sm transition hover:border-ink";

export default async function AboutPage() {
  const [site, projects, passport] = await Promise.all([getSite(), getProjects(), getPassport()]);
  const live = projects.filter((p) => p.status === "live").length;
  const since = Math.min(...projects.map((p) => p.year));
  const stampCount = passport.filter((s) => s.earned).length;

  return (
    <main className="mx-auto flex max-w-site flex-col gap-16 px-gutter pt-12 pb-20">
      <div className="flex flex-wrap items-start gap-16">
        <aside className="flex w-full flex-col gap-5 md:sticky md:top-20 md:w-80 md:shrink-0">
          <div className="grid animate-fade-up grid-cols-2 items-center gap-4 rounded-panel p-7 shadow-float">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex size-26 items-center justify-center rounded-full bg-placeholder text-xs text-muted">[Photo]</div>
              <span className="text-2xl font-semibold tracking-tight">Chris</span>
              <span className="text-xs font-medium">{site.role}</span>
            </div>
            <dl className="flex flex-col">
              {[
                [String(projects.length), "Projects"],
                [String(live), "Shipped & live"],
                [String(stampCount), "Passport stamps"],
                [String(since), "Designing since"],
              ].map(([n, l], i, arr) => (
                <div key={l} className={i < arr.length - 1 ? "flex flex-col-reverse border-b border-line-strong py-2.5" : "flex flex-col-reverse pt-2.5"}>
                  <dt className="text-xs font-medium">{l}</dt>
                  <dd className="text-xl font-semibold">{n}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col gap-3 rounded-card border border-line-strong p-6">
            <span className="text-lg font-semibold">Chris’s confirmed information</span>
            {["Email address", "LinkedIn profile", `${live} live sites`].map((t) => (
              <span key={t} className="flex items-center gap-2.5">
                <Check aria-hidden className="size-4.5 stroke-3 text-ok" /> {t}
              </span>
            ))}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 basis-lg flex-col gap-8">
          <Reveal>
          <section className="flex animate-fade-up flex-col gap-4 border-b border-line pb-8">
            <h1 className="text-4xl font-semibold tracking-tight">About Chris</h1>
            <ul className="flex flex-col gap-2.5">
              <li>Lives in {site.location}</li>
              <li>Works mostly by email, with calls when needed. Flexible across time zones.</li>
              <li>{site.replyTime}</li>
            </ul>
            {site.story.map((p) => (
              <p key={p.slice(0, 24)} className="text-xl">{p}</p>
            ))}
          </section>
          </Reveal>

          <Reveal>

          <section className="flex flex-col gap-4 border-b border-line pb-8">
            <h2 className="text-xl font-semibold">What a karinderya taught me about design</h2>
            <p className="text-xl">{site.karinderya}</p>
            <ul className="flex flex-wrap gap-2">
              {site.interests.map((i) => <li key={i} className={chip}>{i}</li>)}
            </ul>
          </section>

          </Reveal>

          <Reveal>

          <section className="flex flex-col gap-4 border-b border-line pb-8">
            <h2 className="text-xl font-semibold">House rules (how I work)</h2>
            <div className="grid gap-x-7 gap-y-4.5 sm:grid-cols-2">
              {site.houseRules.map((r) => (
                <div key={r.title} className="flex flex-col gap-1">
                  <span className="font-medium">{r.title}</span>
                  <span className="text-sm text-muted">{r.body}</span>
                </div>
              ))}
            </div>
          </section>

          </Reveal>

          <Reveal>

          <section className="flex flex-col gap-4 border-b border-line pb-8">
            <h2 className="text-xl font-semibold">What’s in the toolbox</h2>
            {site.tools.map((g) => (
              <div key={g.group} className="flex flex-col gap-2">
                <span className="text-xs font-medium tracking-wider text-muted uppercase">{g.group}</span>
                <ul className="flex flex-wrap gap-2">
                  {g.items.map((t) => <li key={t} className={chip}>{t}</li>)}
                </ul>
              </div>
            ))}
            <Notice tone="info">{site.inTheWorks}</Notice>
          </section>

          </Reveal>

          <Reveal>

          <section className="flex flex-col gap-4 border-b border-line pb-8">
            <h2 className="text-xl font-semibold">What clients say</h2>
            {site.testimonials.map((t) => (
              <figure key={t.name} className="flex max-w-xl flex-col gap-2.5 rounded-card border border-line-strong p-5">
                <span aria-label="5 out of 5 stars" className="text-sm tracking-widest">★★★★★</span>
                <blockquote className="">{t.quote}</blockquote>
                <figcaption className="flex items-center gap-3 pt-1">
                  <span className="size-10 rounded-full bg-placeholder" />
                  <span className="flex flex-col">
                    <span className="font-medium">{t.name}</span>
                    <span className="text-sm text-muted">{t.title} · {t.year}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </section>

          </Reveal>

          <Reveal>

          <section id="contact" aria-labelledby="contact-title" className="flex scroll-mt-20 flex-col gap-4">
            <h2 id="contact-title" className="text-xl font-semibold">Let’s talk</h2>
            <p className="text-xl">Roles, projects, rough ideas or just design talk. No detailed pitch needed.</p>
            <div className="flex flex-wrap items-center gap-2.5">
              <Link href="/contact" className={buttonClass("primary")}>Send a message</Link>
              <a href={`mailto:${site.email}`} className={buttonClass("secondary")}>Email me</a>
              <a href={site.calendlyUrl} target="_blank" rel="noopener" className={buttonClass("tertiary")}>Book a virtual coffee</a>
              {site.resumeUrl && <a href={site.resumeUrl} target="_blank" rel="noopener" className={buttonClass("tertiary")}>Résumé</a>}
              {site.socials.map((s) => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener" className={buttonClass("tertiary")}>{s.label}</a>
              ))}
            </div>
          </section>

          </Reveal>
        </div>
      </div>

      <div className="border-t border-line pt-12">
        <PassportSection stamps={passport} id="about-passport" />
      </div>
    </main>
  );
}
