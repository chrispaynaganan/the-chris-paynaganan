import Link from "next/link";
import type { LegalDoc } from "@/content/legal";

export function LegalPage({ doc, other }: { doc: LegalDoc; other: { label: string; href: string } }) {
  return (
    <main className="mx-auto grid max-w-site gap-12 px-gutter pt-12 pb-20 lg:grid-cols-12">
      <aside className="flex flex-col gap-3 lg:sticky lg:top-20 lg:col-span-3 lg:self-start">
        <span className="text-sm text-muted">Last updated {doc.updated}</span>
        <nav aria-label="On this page" className="flex flex-col gap-2 text-sm">
          {doc.sections.map((s, i) => (
            <a key={s.heading} href={`#s-${i}`} className="text-body hover:text-ink hover:underline hover:underline-offset-4">
              {s.heading}
            </a>
          ))}
        </nav>
        <Link href={other.href} className="pt-2 text-sm font-medium underline underline-offset-4">
          {other.label}
        </Link>
      </aside>
      <article className="flex max-w-3xl flex-col gap-10 lg:col-span-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{doc.title}</h1>
          <p className="text-lg text-body">{doc.intro}</p>
        </div>
        {doc.sections.map((s, i) => (
          <section key={s.heading} id={`s-${i}`} className="flex scroll-mt-20 flex-col gap-3 border-t border-line pt-6">
            <h2 className="text-xl font-semibold">{s.heading}</h2>
            {s.body.map((p) => (
              <p key={p.slice(0, 30)} className="text-body">
                {p}
              </p>
            ))}
          </section>
        ))}
      </article>
    </main>
  );
}
