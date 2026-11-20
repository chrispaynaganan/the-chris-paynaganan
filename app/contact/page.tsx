import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, FileText, Mail, MessageCircle } from "lucide-react";
import { getSite } from "@/lib/content";
import { ContactForm } from "@/components/contact/ContactForm";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const site = await getSite();
  const linkedIn = site.socials.find((s) => s.label === "LinkedIn")?.url;
  const facebook = site.socials.find((s) => s.label === "Facebook")?.url;

  const ways = [
    { icon: Mail, title: "Email", body: site.email, href: `mailto:${site.email}`, external: false },
    { icon: CalendarDays, title: "Book a virtual coffee", body: "Pick a time on Calendly", href: site.calendlyUrl, external: true },
    ...(linkedIn ? [{ icon: ArrowUpRight, title: "LinkedIn", body: "Connect or message me", href: linkedIn, external: true }] : []),
    ...(facebook ? [{ icon: MessageCircle, title: "Chat on Facebook", body: "Quick questions welcome", href: facebook, external: true }] : []),
    ...(site.resumeUrl ? [{ icon: FileText, title: "Résumé", body: "Open the PDF", href: site.resumeUrl, external: true }] : []),
  ];

  return (
    <main className="mx-auto flex max-w-site flex-col gap-12 px-gutter pt-12 pb-20">
      <Reveal y={10} className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Let’s talk</h1>
        <p className="max-w-2xl text-lg text-body">
          Roles, projects, rough ideas or just design talk. No detailed pitch needed. {site.replyTime}.
        </p>
      </Reveal>

      <div className="grid gap-12 lg:grid-cols-12">
        <section aria-labelledby="ways-title" className="flex flex-col gap-4 lg:col-span-5">
          <h2 id="ways-title" className="text-lg font-semibold">Reach me directly</h2>
          <ul className="flex flex-col gap-3">
            {ways.map((w, i) => (
              <li key={w.title}>
                <Reveal delay={i * 0.06} y={10}>
                  <a
                    href={w.href}
                    target={w.external ? "_blank" : undefined}
                    rel={w.external ? "noopener" : undefined}
                    className="group flex items-center gap-4 rounded-2xl border border-line-strong p-4 transition hover:border-ink hover:shadow-card"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-placeholder">
                      <w.icon aria-hidden className="size-4.5" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="font-medium">{w.title}</span>
                      <span className="truncate text-sm text-muted">{w.body}</span>
                    </span>
                    <ArrowUpRight aria-hidden className="size-4 text-muted transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink" />
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted">
            Hiring for a client project instead?{" "}
            <Link href="/business#inquire" className="font-medium text-ink underline underline-offset-4">
              Start a project with Chris for Business
            </Link>
            .
          </p>
        </section>

        <section aria-labelledby="form-title" className="flex flex-col gap-4 rounded-3xl border border-line-strong p-6 shadow-card md:p-8 lg:col-span-7">
          <h2 id="form-title" className="text-lg font-semibold">Send a message</h2>
          <ContactForm email={site.email} reasons={["Job opportunity", "Freelance project", "Collaboration", "Just saying hi"]} />
        </section>
      </div>
    </main>
  );
}
