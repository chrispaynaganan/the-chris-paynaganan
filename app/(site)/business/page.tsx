import type { Metadata } from "next";
import { getProjects, getSite } from "@/lib/content";
import { Bundles } from "@/components/business/Bundles";
import { Faq } from "@/components/business/Faq";
import { InquiryForm } from "@/components/business/InquiryForm";
import { Marquee } from "@/components/business/Marquee";
import { AddOns } from "@/components/business/AddOns";
import { Reveal } from "@/components/motion/Reveal";
import FoldText from "@/components/reactbits/FoldText";
import { buttonClass } from "@/components/ui/button";
import { BusinessGlow } from "@/components/business/BusinessGlow";
import { Check, X } from "lucide-react";

export const metadata: Metadata = { title: "Chris for Business" };

/** "01 — Bundles" chapter heading, left-aligned, with a hairline across the page. */
function Chapter({ n, label, title, id }: { n: string; label: string; title: string; id: string }) {
  return (
    <Reveal className="flex flex-col gap-6">
      <div className="flex items-center gap-4 text-xs font-medium tracking-widest text-paper/60 uppercase">
        <span>{n}</span>
        <span aria-hidden className="h-px flex-1 bg-paper/15" />
        <span>{label}</span>
      </div>
      <h2 id={id} className="max-w-4xl text-4xl md:text-6xl">
        {title}
      </h2>
    </Reveal>
  );
}

export default async function BusinessPage() {
  const [site, projects] = await Promise.all([getSite(), getProjects()]);
  const b = site.business;
  const live = projects.filter((p) => p.status === "live").length;

  // Every line here is drawn from the bundles and how Chris works
  const promises = [
    ["One person, start to finish", "The person on your discovery call is the one designing and building your site."],
    ["You own everything", "Figma file, design system, site and documentation, handed over at launch."],
    ["A written update every Friday", "What’s done, what’s next, and what I need from you."],
    ["Replies within 1 business day", "Read and answered by Chris himself."],
  ];
  const quote = site.testimonials.find((t) => t.quote.trim() && !t.quote.trim().startsWith("["));
  const industries = ["Healthcare", "Fitness", "Accounting", "Voice & audio", "Coaching", "Maritime", "Personal brands", "SaaS"];

  return (
    // data-edge squares off every corner while this page is open (see globals.css)
    <div data-theme="dark" data-edge className="relative isolate bg-ink text-paper">
      <BusinessGlow />
      <div className="relative z-1">
      {/* Hero */}
      <section className="mx-auto flex max-w-site flex-col gap-16 px-gutter pt-20 pb-16 md:pt-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="flex flex-col gap-8 lg:col-span-8">
            <Reveal y={8} className="flex items-center gap-3 text-xs font-medium tracking-widest uppercase">
              <span className="rounded-full border border-paper/40 px-3 py-1">Chris for Business</span>
              <span className="text-paper/60">One person, start to finish</span>
            </Reveal>
            <h1 className="text-5xl md:text-7xl">
              {/* React Bits FoldText: each letter swings down from its top edge, and folds away near the cursor */}
              <FoldText
                text={site.tagline}
                foldStyle="paper"
                splitBy="char"
                hinge="top"
                trigger="mount"
                foldAngle={92}
                duration={0.65}
                stagger={0.03}
                ease="power3.out"
                hoverRefold
                refoldRadius={140}
                refoldAngle={45}
                perspective={700}
                creaseShading={0.55}
                fontSize="1em"
                fontWeight={400}
              />
            </h1>
          </div>
          <Reveal delay={0.5} className="flex flex-col justify-end gap-6 lg:col-span-4">
            <p className="text-lg text-paper/75">{b.intro}</p>
            <div className="flex flex-wrap gap-3">
              <a href={site.calendlyUrl} target="_blank" rel="noopener" className={buttonClass("primary", undefined, true)}>
                Book a discovery call
              </a>
              <a href="#bundles" className={buttonClass("secondary", undefined, true)}>See the bundles</a>
            </div>
            <p className="text-sm text-paper/60">Recent work: Resonate with Erwin · Boses Filipina · Hustle &amp; Muscle · Oh, Yvi!</p>
          </Reveal>
        </div>

        <ul className="grid grid-cols-1 border-t border-paper/15 sm:grid-cols-2 lg:grid-cols-4">
          {promises.map(([title, body], i) => (
            <li key={title} className="border-b border-paper/15 py-6 sm:pr-6 lg:border-b-0 lg:border-l lg:px-6 lg:first:border-l-0 lg:first:pl-0">
              <Reveal delay={0.6 + i * 0.08} y={10} className="flex flex-col gap-1.5">
                <span className="font-medium">{title}</span>
                <span className="text-sm text-paper/60">{body}</span>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <Marquee items={industries} />

      <main className="mx-auto flex max-w-site flex-col gap-32 px-gutter pt-24 pb-32">
        {/* Why me */}
        <section id="why" aria-labelledby="w-title" className="flex scroll-mt-24 flex-col gap-12">
          <Chapter n="01" label="Why me" id="w-title" title="One person who designs it, builds it and answers for it." />
          <Reveal className="grid gap-8 rounded-panel bg-paper p-10 text-ink md:grid-cols-3 md:p-14">
            <div className="flex flex-col gap-2">
              <span className="text-6xl">{projects.length}</span>
              <span className="text-sm text-muted">Projects designed, from healthcare to voice</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-6xl">{live}</span>
              <span className="text-sm text-muted">Client sites live right now</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-6xl">1</span>
              <span className="text-sm text-muted">Point of contact, from first call to launch</span>
            </div>
          </Reveal>
          <ul className="grid gap-x-6 gap-y-10 md:grid-cols-3">
            {b.whyMe.map((w, i) => (
              <li key={w.title}>
                <Reveal delay={i * 0.08} y={14} className="flex flex-col gap-3 border-t border-paper/30 pt-5">
                  <span className="text-xl">{w.title}</span>
                  <span className="text-paper/65">{w.body}</span>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        {/* Who it's for */}
        <section id="fit" aria-labelledby="fit-title" className="flex scroll-mt-24 flex-col gap-12">
          <Chapter n="02" label="Who it’s for" id="fit-title" title="A good fit, and an honest not." />
          <div className="grid gap-10 md:grid-cols-2">
            {[
              { label: "A good fit if you’re…", items: b.fit.good, mark: Check },
              { label: "Probably not a fit if you…", items: b.fit.not, mark: X },
            ].map((col, c) => (
              <Reveal key={col.label} delay={c * 0.08} className="flex flex-col gap-5 rounded-panel border border-paper/15 p-8">
                <span className="text-xs font-medium tracking-widest text-paper/60 uppercase">{col.label}</span>
                <ul className="flex flex-col gap-4">
                  {col.items.map((it) => (
                    <li key={it} className="flex items-start gap-3 text-paper/85">
                      <col.mark aria-hidden className="mt-1 size-4 shrink-0 stroke-3" /> {it}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Bundles */}
        <section id="bundles" aria-labelledby="b-title" className="flex scroll-mt-24 flex-col gap-12">
          <Chapter n="03" label="Bundles" id="b-title" title="Three ways to work together." />
          <Reveal>
            <p className="max-w-3xl text-lg text-paper/75">
              Each bundle is a complete project, from research to launch. Pick the one closest to where you are now, and we’ll confirm it on the call.
            </p>
          </Reveal>
          <Bundles business={b.companyBundles} personal={b.bundles} notes={b.notes} />
        </section>

        {/* Process */}
        <section id="process" aria-labelledby="p-title" className="flex scroll-mt-24 flex-col gap-12">
          <Chapter n="04" label="Process" id="p-title" title="How a project unfolds." />
          <Reveal>
            <p className="max-w-3xl text-lg text-paper/75">
              Nine steps, and you’ll always know which one we’re on. Weeks shown are for The Foundation; The Alignment runs about 10 weeks and The Mandate about 20, with the same steps.
            </p>
          </Reveal>
          <ol className="flex flex-col">
            <li aria-hidden className="hidden grid-cols-12 gap-6 border-b border-paper/30 pb-3 text-xs font-medium tracking-widest text-paper/50 uppercase lg:grid">
              <span className="col-span-4">Step</span>
              <span className="col-span-3">I do</span>
              <span className="col-span-2">You do</span>
              <span className="col-span-3">You get</span>
            </li>
            {b.process.map((s, i) => (
              <li key={s.title}>
                <Reveal delay={Math.min(i, 4) * 0.05} y={10} className="grid gap-3 border-b border-paper/15 py-6 lg:grid-cols-12 lg:gap-6">
                  <div className="flex items-baseline gap-4 lg:col-span-4">
                    <span className="text-3xl text-paper/40">{String(i + 1).padStart(2, "0")}</span>
                    <div className="flex flex-col gap-1">
                      <span className="text-xl">{s.title}</span>
                      {s.when && <span className="text-sm text-paper/55">{s.when}</span>}
                    </div>
                  </div>
                  <p className="text-paper/80 lg:col-span-3">{s.body}</p>
                  {s.you && (
                    <p className="text-sm text-paper/70 lg:col-span-2">
                      <span className="text-paper/45 lg:hidden">You do: </span>
                      {s.you}
                    </p>
                  )}
                  {s.get && (
                    <p className="text-sm text-paper/70 lg:col-span-3">
                      <span className="text-paper/45 lg:hidden">You get: </span>
                      {s.get}
                    </p>
                  )}
                </Reveal>
              </li>
            ))}
          </ol>
          <Reveal>
            <p className="text-paper/70">
              Every Friday, you get a written update: what’s done, what’s next and anything I need from you. After the design step, you can stop if the direction isn’t right.
            </p>
          </Reveal>
        </section>

        {/* Guarantees */}
        <section id="guarantees" aria-labelledby="g-title" className="flex scroll-mt-24 flex-col gap-12">
          <Chapter n="05" label="Guarantees" id="g-title" title="What you can count on." />
          <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {b.guarantees.map((g, i) => (
              <li key={g.title}>
                <Reveal delay={(i % 3) * 0.08} y={14} className="flex flex-col gap-3 border-t border-paper/30 pt-5">
                  <span className="text-xl">{g.title}</span>
                  <span className="text-sm text-paper/65">{g.body}</span>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        {/* Work */}
        <section id="work" aria-labelledby="c-title" className="flex scroll-mt-24 flex-col gap-12">
          <Chapter n="06" label="Work" id="c-title" title="Work that’s already working." />
          <ul className="grid gap-5 lg:grid-cols-3">
            {b.caseStudies.map((c, i) => (
              <li key={c.name}>
                <Reveal delay={i * 0.08} className="flex h-full flex-col gap-5 rounded-panel border border-paper/15 p-8 transition duration-500 hover:border-paper/50">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium tracking-widest text-paper/60 uppercase">{c.industry}</span>
                    <h3 className="text-3xl">{c.name}</h3>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium">The problem</span>
                    <p className="text-sm text-paper/70">{c.problem}</p>
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <span className="text-sm font-medium">What I built</span>
                    <p className="text-sm text-paper/70">{c.built}</p>
                  </div>
                  {c.href && (
                    <a href={c.href} className={buttonClass("tertiary", "self-start", true)}>
                      Read the full story
                    </a>
                  )}
                </Reveal>
              </li>
            ))}
          </ul>
          {quote && (
            <Reveal className="flex flex-col gap-4 rounded-panel bg-paper p-10 text-ink md:p-14">
              <p className="max-w-4xl text-2xl md:text-3xl">“{quote.quote}”</p>
              <span className="text-sm font-medium">
                {quote.name} · <span className="font-normal text-muted">{quote.title}</span>
              </span>
            </Reveal>
          )}
        </section>

        {/* Add-ons */}
        <section id="addons" aria-labelledby="a-title" className="flex scroll-mt-24 flex-col gap-12">
          <Chapter n="07" label="Add-ons" id="a-title" title="Add what you need." />
          <AddOns addons={b.addons} />
        </section>

        {/* FAQ */}
        <section id="faq" aria-labelledby="f-title" className="flex scroll-mt-24 flex-col gap-10">
          <Chapter n="08" label="Questions" id="f-title" title="Before you ask." />
          <Reveal>
            <Faq items={b.faqs} dark />
          </Reveal>
        </section>

        {/* Inquiry */}
        <section id="inquire" aria-labelledby="i-title" className="flex scroll-mt-24 flex-col gap-12">
          <Chapter n="09" label="Begin" id="i-title" title="Tell me what’s not working." />
          <div className="grid gap-12 lg:grid-cols-12">
            <Reveal className="flex flex-col gap-8 lg:col-span-4">
              <div className="flex flex-col gap-4">
                <p className="text-2xl">A rough idea is plenty. I read every message myself and reply within 1 business day.</p>
                <p className="text-sm text-paper/60">Not sure which bundle? Leave it on “Help me choose.” We’ll settle it together on the call.</p>
              </div>
              <div className="flex flex-col gap-4 rounded-panel border border-paper/15 p-6">
                <span className="text-xs font-medium tracking-widest text-paper/60 uppercase">What happens on the call · 45 min, free</span>
                <ol className="flex flex-col gap-3">
                  {b.callAgenda.map((a, i) => (
                    <li key={a.title} className="flex items-baseline gap-3 text-sm">
                      <span className="text-paper/40">{i + 1}</span>
                      <span className="flex-1 text-paper/85">{a.title}</span>
                      <span className="shrink-0 text-paper/50">{a.minutes}</span>
                    </li>
                  ))}
                </ol>
                <p className="text-sm text-paper/70">{b.callOutcome}</p>
                <a href={site.calendlyUrl} target="_blank" rel="noopener" className={buttonClass("secondary", "self-start", true)}>
                  Book a discovery call
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-8">
              <InquiryForm
                dark
                email={site.email}
                bundles={b.bundles.map((x) => x.name)}
                businessBundles={b.companyBundles.map((x) => x.name)}
                budgets={b.budgets}
                timelines={b.timelines}
              />
            </Reveal>
          </div>
        </section>

        {/* Closing */}
        <Reveal className="flex flex-col items-start gap-6 border-t border-paper/15 pt-16">
          <h2 className="max-w-4xl text-4xl md:text-6xl">Let’s find out what your website should be doing for you.</h2>
          <p className="max-w-2xl text-lg text-paper/70">One call. No pressure. You’ll know exactly what you need, and what it costs, by the end of it.</p>
          <div className="flex flex-wrap items-center gap-4">
            <a href={site.calendlyUrl} target="_blank" rel="noopener" className={buttonClass("primary", undefined, true)}>
              Book a discovery call
            </a>
            <a href={`mailto:${site.email}`} className={buttonClass("tertiary", undefined, true)}>Or email me directly</a>
          </div>
        </Reveal>
      </main>
      </div>
    </div>
  );
}
