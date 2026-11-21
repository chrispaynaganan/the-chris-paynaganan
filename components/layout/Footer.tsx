import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getProjects, getSite } from "@/lib/content";

// Full-width footer, laid out in columns like a travel site's.
export async function Footer() {
  const [site, projects] = await Promise.all([getSite(), getProjects()]);
  const linkClass = "text-sm text-ink hover:underline hover:underline-offset-4";

  const columns: { title: string; links: { label: string; href: string; external?: boolean }[] }[] = [
    { title: "Projects", links: projects.map((p) => ({ label: p.name, href: `/projects/${p.slug}` })) },
    {
      title: "Chris",
      links: [
        { label: "About me", href: "/about" },
        { label: "Passport stamps", href: "/#passport" },
        { label: "Gallery", href: "/gallery" },
        ...(site.resumeUrl ? [{ label: "Résumé", href: site.resumeUrl, external: true }] : []),
        { label: "Book a virtual coffee", href: site.calendlyUrl, external: true },
      ],
    },
    {
      title: "Chris for Business",
      links: [
        { label: "Bundles", href: "/business#bundles" },
        { label: "Add-ons", href: "/business#addons" },
        { label: "How a project goes", href: "/business#process" },
        { label: "FAQ", href: "/business#faq" },
        { label: "Start a project", href: "/business#inquire" },
      ],
    },
    {
      title: "Connect",
      links: [
        { label: "Contact", href: "/contact" },
        { label: "Email me", href: `mailto:${site.email}`, external: true },
        ...site.socials.map((s) => ({ label: s.label, href: s.url, external: true })),
      ],
    },
  ];

  return (
    <footer className="w-full border-t border-line-strong bg-paper">
      <div className="mx-auto max-w-site px-gutter pt-12 pb-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-5">
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <h2 className="font-medium">{col.title}</h2>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a href={l.href} target={l.href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener" className={linkClass}>
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className={linkClass}>
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
            <h2 className="text-sm font-medium">{site.enterprise.label}</h2>
            <a
              href={site.enterprise.url}
              target="_blank"
              rel="noopener"
              className="group flex flex-col gap-2 rounded-card border border-line-strong bg-paper p-4 transition hover:border-ink hover:shadow-float"
            >
              <span className="flex items-center justify-between text-base font-medium">
                Oh, Yvi!
                <ArrowUpRight aria-hidden className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <span className="text-sm text-muted">Papered goodness. Stationery made in Lipa, Batangas.</span>
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line-strong pt-6 text-caption text-muted md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>© {new Date().getFullYear()} Chris Paynaganan</span>
            <span aria-hidden>·</span>
            <Link href="/privacy-policy" className="hover:underline hover:underline-offset-4">Privacy</Link>
            <span aria-hidden>·</span>
            <Link href="/terms-and-conditions" className="hover:underline hover:underline-offset-4">Terms</Link>
            <span aria-hidden>·</span>
            <a href={site.enterprise.url} target="_blank" rel="noopener" className="hover:underline hover:underline-offset-4">
              {site.enterprise.label}
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span>{site.location}</span>
            {site.socials.map((s) => (
              <a key={s.label} href={s.url} target="_blank" rel="noopener" className="text-ink hover:underline hover:underline-offset-4">
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
