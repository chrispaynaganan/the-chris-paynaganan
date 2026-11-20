import type { Metadata } from "next";
import Link from "next/link";
import { getSite } from "@/lib/content";
import { Bundles } from "@/components/business/Bundles";
import { Faq } from "@/components/business/Faq";
import { InquiryForm } from "@/components/business/InquiryForm";
import { Notice } from "@/components/ui/Notice";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = { title: "Chris for Business" };

export default async function BusinessPage() {
  const site = await getSite();
  const b = site.business;
  return (
    <>
      <section className="bg-ink text-paper">
        <div className="mx-auto flex max-w-6xl animate-fade-up flex-col gap-5 px-6 pt-18 pb-22 md:px-10">
          <span className="text-sm font-bold tracking-widest uppercase">Chris for Business · for clients</span>
          <h1 className="max-w-3xl text-5xl font-extrabold tracking-tighter md:text-6xl">{site.tagline}</h1>
          <p className="max-w-2xl text-lg">{b.intro}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a href="#bundles" className="inline-flex h-10 items-center rounded-lg bg-paper px-4 text-sm font-semibold text-ink transition hover:bg-placeholder-alt active:scale-97">
              See bundles
            </a>
            <a href={site.calendlyUrl} target="_blank" rel="noopener" className="inline-flex h-10 items-center rounded-lg border border-paper px-4 text-sm font-semibold transition hover:bg-ink-soft active:scale-97">
              Book a discovery call
            </a>
          </div>
        </div>
      </section>

      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-6 pt-14 pb-20 md:px-10">
        <Reveal>
        <section id="bundles" aria-labelledby="b-title" className="flex scroll-mt-24 flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h2 id="b-title" className="text-3xl font-extrabold tracking-tight">Professional bundles</h2>
            <p className="text-muted">For people building a personal brand or portfolio.</p>
          </div>
          <Bundles bundles={b.bundles} />
          <Notice tone="warn">PHP prices are estimates. Pricing is set in USD and can shift with the exchange rate.</Notice>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line-strong p-6">
            <div className="flex flex-col gap-1">
              <span className="text-lg font-bold">Business bundles</span>
              <span className="text-sm text-muted">{b.businessBundles.join(" · ")}</span>
            </div>
            <Link href="#inquire" className="font-semibold underline underline-offset-4 hover:decoration-2">
              Ask about business bundles
            </Link>
          </div>
        </section>
        </Reveal>

        <Reveal>

        <section id="addons" aria-labelledby="a-title" className="flex scroll-mt-24 flex-col gap-5">
          <h2 id="a-title" className="text-3xl font-extrabold tracking-tight">Add-ons</h2>
          <ul className="grid gap-x-8 md:grid-cols-2">
            {b.addons.map((a) => (
              <li key={a.name} className="flex justify-between gap-4 border-b border-line py-4">
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-semibold">{a.name}</span>
                  <span className="text-sm text-muted">{a.description}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end">
                  <span className="font-bold">{a.usd}</span>
                  <span className="text-xs text-muted">{a.php}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        </Reveal>

        <Reveal>

        <section id="process" aria-labelledby="p-title" className="flex scroll-mt-24 flex-col gap-5">
          <h2 id="p-title" className="text-3xl font-extrabold tracking-tight">How a project goes</h2>
          <ol className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {b.process.map((s, i) => (
              <li key={s.title} className="flex animate-fade-up flex-col gap-2 rounded-2xl border border-line-strong p-4.5" style={{ animationDelay: `${i * 60}ms` }}>
                <span className="text-sm font-bold text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-bold">{s.title}</span>
                <span className="text-sm text-muted">{s.body}</span>
              </li>
            ))}
          </ol>
        </section>

        </Reveal>

        <Reveal>

        <section id="faq" aria-labelledby="f-title" className="flex max-w-3xl scroll-mt-24 flex-col gap-2">
          <h2 id="f-title" className="mb-2 text-3xl font-extrabold tracking-tight">FAQ</h2>
          <Faq items={b.faqs} />
        </section>

        </Reveal>

        <Reveal>

        <section id="inquire" aria-labelledby="i-title" className="flex scroll-mt-24 flex-wrap gap-10 rounded-3xl border border-line-strong p-6 shadow-card md:p-10">
          <div className="flex flex-1 basis-72 flex-col gap-3">
            <h2 id="i-title" className="text-3xl font-extrabold tracking-tight">Start a project</h2>
            <p className="font-diary text-xl italic">A rough idea is plenty. I read every message myself and usually reply within a day or two.</p>
            <p className="text-sm text-muted">Not sure which bundle? Pick the closest one. We’ll settle it together.</p>
          </div>
          <InquiryForm
            email={site.email}
            bundles={b.bundles.map((x) => x.name)}
            businessBundles={b.businessBundles}
            paymentOptions={b.paymentOptions}
            timelines={b.timelines}
          />
        </section>

        </Reveal>
      </main>
    </>
  );
}
