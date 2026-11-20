"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { buttonClass } from "@/components/ui/button";
import { Logo } from "./Logo";

const tabs = [
  { href: "/", label: "Projects", match: (p: string) => p === "/" || p.startsWith("/projects") },
  { href: "/gallery", label: "Gallery", match: (p: string) => p.startsWith("/gallery") },
];

export function Header() {
  const pathname = usePathname();
  const isBusiness = pathname.startsWith("/business");

  if (isBusiness) {
    return (
      <header className="sticky top-0 z-30 bg-ink text-paper">
        <div className="mx-auto flex max-w-site flex-wrap items-center justify-between gap-4 px-6 py-4 md:px-10">
          <Logo dark business />
          <nav aria-label="Business sections" className="flex flex-wrap gap-5 text-base font-semibold">
            {[
              ["#bundles", "Bundles"],
              ["#addons", "Add-ons"],
              ["#process", "Process"],
              ["#faq", "FAQ"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="hover:underline hover:underline-offset-4">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/" className="font-semibold text-paper underline underline-offset-4 hover:decoration-2">
              Back to projects
            </Link>
            <a href="#inquire" className="inline-flex h-10 items-center rounded-lg bg-paper px-4 text-sm font-semibold text-ink transition hover:bg-placeholder-alt active:scale-97">
              Start a project
            </a>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper">
      <div className="mx-auto flex max-w-site flex-wrap items-center justify-between gap-4 px-6 py-4 md:px-10">
        <Logo />
        <nav aria-label="Sections" className="flex flex-wrap items-center gap-1">
          {tabs.map((t) => {
            const on = t.match(pathname);
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition",
                  on ? "bg-placeholder text-ink" : "text-muted hover:bg-surface hover:text-ink",
                )}
              >
                {t.label}
              </Link>
            );
          })}
          <Link
            href="/business"
            className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-muted transition hover:bg-surface hover:text-ink"
          >
            Chris
            <span className="rounded bg-ink px-1.5 py-0.5 text-xs font-bold tracking-wider text-paper uppercase">for Business</span>
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/about" className={buttonClass("tertiary")} aria-current={pathname.startsWith("/about") ? "page" : undefined}>
            About me
          </Link>
          <Link href="/about#contact" className={buttonClass("primary")}>
            Let&apos;s talk
          </Link>
        </div>
      </div>
    </header>
  );
}
