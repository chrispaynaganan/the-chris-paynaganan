import type { Metadata } from "next";
import { getProjects, getSite } from "@/lib/content";
import { Bundles } from "@/components/business/Bundles";
import { Faq } from "@/components/business/Faq";
import { InquiryForm } from "@/components/business/InquiryForm";
import { Marquee } from "@/components/business/Marquee";
import { Notice } from "@/components/ui/Notice";
import { Reveal } from "@/components/motion/Reveal";
import FoldText from "@/components/reactbits/FoldText";
import { buttonClass } from "@/components/ui/button";
import { BusinessGlow } from "@/components/business/BusinessGlow";

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
    ["One person, start to finish", "Design and development by the same hands."],
    ["Figma file + design system", "Included with every bundle."],
    ["Built-in CRM + documentation", "Yours to keep after launch."],
    ["Replies within a day or two", "Read and answered by Chris himself."],
  ];
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
              <span className="text-paper/60">Private studio · for clients</span>
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
              <a href="#inquire" className={buttonClass("primary", undefined, true)}>Request a consultation</a>
              <a href={site.calendlyUrl} target="_blank" rel="noopener" className={buttonClass("secondary", undefined, true)}>
                Book a discovery call
              </a>
            </div>
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
        {/* Bundles */}
        <section id="bundles" aria-labelledby="b-title" className="flex scroll-mt-24 flex-col gap-12">
          <Chapter n="01" label="Bundles" id="b-title" title="Three ways to work together." />
          <Bundles bundles={b.bundles} />
          <Reveal className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-6 rounded-panel border border-paper/15 p-8 transition duration-500 hover:border-paper/50">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium tracking-widest text-paper/60 uppercase">For companies</span>
                <span className="text-3xl">{b.businessBundles.join(" · ")}</span>
              </div>
              <a href="#inquire" className={buttonClass("secondary", undefined, true)}>Ask about business bundles</a>
            </div>
            <Notice tone="warn">PHP prices are estimates. Pricing is set in USD and can shift with the exchange rate.</Notice>
          </Reveal>
        </section>

        {/* Add-ons */}
        <section id="addons" aria-labelledby="a-title" className="flex scroll-mt-24 flex-col gap-12">
          <Chapter n="02" label="Add-ons" id="a-title" title="À la carte." />
          <ul className="grid gap-x-16 gap-y-8 lg:grid-cols-2">
            {b.addons.map((a, i) => (
              <li key={a.name}>
                <Reveal delay={(i % 2) * 0.08} y={12} className="group flex flex-col gap-1.5">
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl">{a.name}</span>
                    <span aria-hidden className="mb-1.5 flex-1 border-b border-dotted border-paper/30 transition group-hover:border-paper/70" />
                    <span className="font-medium">{a.usd}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-sm text-paper/55">
                    <span>{a.description}</span>
                    <span className="shrink-0">{a.php}</span>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        {/* Process */}
        <section id="process" aria-labelledby="p-title" className="flex scroll-mt-24 flex-col gap-12">
          <Chapter n="03" label="Process" id="p-title" title="How a project unfolds." />
          <ol className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-6">
            {b.process.map((s, i) => (
              <li key={s.title}>
                <Reveal delay={i * 0.08} y={14} className="flex flex-col gap-3 border-t border-paper/30 pt-5">
                  <span className="text-4xl text-paper/40">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-medium">{s.title}</span>
                  <span className="text-sm text-paper/60">{s.body}</span>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>

        {/* Proof */}
        <Reveal className="grid gap-8 rounded-panel bg-paper p-10 text-ink md:grid-cols-3 md:p-14">
          <div className="flex flex-col gap-2">
            <span className="text-6xl">{projects.length}</span>
            <span className="text-sm text-muted">Projects designed, from healthcare to voice</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-6xl">{live}</span>
            <span className="text-sm text-muted">Client sites live right now</span>
          </div>
          <div className="flex flex-col justify-between gap-4">
            <p className="text-xl">“{site.testimonials[0]?.quote}”</p>
            <span className="text-sm font-medium">
              {site.testimonials[0]?.name} · <span className="font-normal text-muted">{site.testimonials[0]?.title}</span>
            </span>
          </div>
        </Reveal>

        {/* FAQ */}
        <section id="faq" aria-labelledby="f-title" className="flex scroll-mt-24 flex-col gap-10">
          <Chapter n="04" label="Questions" id="f-title" title="Before you ask." />
          <Reveal>
            <Faq items={b.faqs} dark />
          </Reveal>
        </section>

        {/* Inquiry */}
        <section id="inquire" aria-labelledby="i-title" className="flex scroll-mt-24 flex-col gap-12">
          <Chapter n="05" label="Begin" id="i-title" title="Start a project." />
          <div className="grid gap-12 lg:grid-cols-12">
            <Reveal className="flex flex-col gap-4 lg:col-span-4">
              <p className="text-2xl">A rough idea is plenty. I read every message myself and usually reply within a day or two.</p>
              <p className="text-sm text-paper/60">Not sure which bundle? Pick the closest one. We’ll settle it together on the call.</p>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-8">
              <InquiryForm
                dark
                email={site.email}
                bundles={b.bundles.map((x) => x.name)}
                businessBundles={b.businessBundles}
                paymentOptions={b.paymentOptions}
                timelines={b.timelines}
              />
            </Reveal>
          </div>
        </section>
      </main>
      </div>
    </div>
  );
}
