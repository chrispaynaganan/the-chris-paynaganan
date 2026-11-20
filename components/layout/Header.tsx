"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu as GlassMenu } from "glisse";
import { Menu as MenuIcon, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonClass } from "@/components/ui/button";
import { useSearchDock } from "@/components/home/SearchDock";
import { Logo } from "./Logo";

const tabs = [
  { href: "/", label: "Projects", match: (p: string) => p === "/" || p.startsWith("/projects") },
  { href: "/gallery", label: "Gallery", match: (p: string) => p.startsWith("/gallery") },
];

const ease = [0.2, 0.7, 0.2, 1] as const;

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 4);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return scrolled;
}

function SiteMenu({ email, linkedIn, calendly, enterpriseUrl }: { email: string; linkedIn: string; calendly: string; enterpriseUrl: string }) {
  const router = useRouter();
  const open = (url: string) => window.open(url, "_blank", "noopener");
  return (
    <GlassMenu
      aria-label="Site menu"
      align="end"
      icon={<MenuIcon aria-hidden className="size-4.5" />}
      items={[
        { label: "About me", onSelect: () => router.push("/about") },
        { label: "Passport stamps", onSelect: () => router.push("/#passport") },
        { label: "Gallery", onSelect: () => router.push("/gallery") },
        "separator",
        { label: "Chris for Business", onSelect: () => router.push("/business") },
        { label: "Book a virtual coffee", onSelect: () => open(calendly) },
        { label: "Email me", onSelect: () => (window.location.href = `mailto:${email}`) },
        { label: "LinkedIn", onSelect: () => open(linkedIn) },
        "separator",
        { label: "Chris Enterprise", onSelect: () => open(enterpriseUrl) },
      ]}
    />
  );
}

export function Header({
  email,
  linkedIn,
  calendly,
  enterpriseUrl,
}: {
  email: string;
  linkedIn: string;
  calendly: string;
  enterpriseUrl: string;
}) {
  const pathname = usePathname();
  const scrolled = useScrolled();
  const { docked, query, openSearch } = useSearchDock();
  const isBusiness = pathname.startsWith("/business");
  const showDock = pathname === "/" && docked;

  if (isBusiness) {
    return (
      <header style={{ viewTransitionName: "site-header" }} className={cn("sticky top-0 z-30 border-b bg-ink text-paper transition duration-300", scrolled ? "border-paper/15" : "border-transparent")}>
        <div className="mx-auto flex max-w-site flex-wrap items-center justify-between gap-4 px-gutter py-4">
          <Logo dark business />
          <nav aria-label="Business sections" className="hidden flex-wrap gap-5 text-sm font-semibold md:flex">
            {[
              ["#bundles", "Bundles"],
              ["#addons", "Add-ons"],
              ["#process", "Process"],
              ["#faq", "FAQ"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="underline-offset-4 decoration-transparent transition hover:underline hover:decoration-paper">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/" transitionTypes={["nav-back"]} className="text-sm font-semibold text-paper underline underline-offset-4 hover:decoration-2">
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
    <header
      style={{ viewTransitionName: "site-header" }}
      className={cn(
        "sticky top-0 z-30 border-b bg-paper transition duration-300",
        scrolled ? "border-transparent shadow-pill" : "border-line",
      )}
    >
      <div className="mx-auto grid max-w-site grid-cols-2 items-center gap-4 px-gutter py-3.5 md:grid-cols-3">
        <Logo />

        <div className="hidden min-h-12 items-center justify-center md:flex">
          <AnimatePresence mode="wait" initial={false}>
            {showDock ? (
              <motion.button
                key="dock"
                type="button"
                onClick={openSearch}
                initial={{ opacity: 0, y: 14, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.92 }}
                transition={{ duration: 0.28, ease }}
                className="flex h-12 cursor-pointer items-center gap-3 rounded-full border border-line-strong py-1.5 pr-1.5 pl-5 text-sm font-semibold shadow-pill transition-shadow hover:shadow-pill-hover"
              >
                <span className="max-w-48 truncate">{query || "Search the diary"}</span>
                <span className="h-5 w-px bg-line-strong" />
                <span className="text-muted">Product designer</span>
                <span className="flex size-8 items-center justify-center rounded-full bg-ink">
                  <Search aria-hidden className="size-3.5 stroke-3 text-paper" />
                </span>
              </motion.button>
            ) : (
              <motion.nav
                key="tabs"
                aria-label="Sections"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease }}
                className="flex items-center gap-1"
              >
                {tabs.map((t) => {
                  const on = t.match(pathname);
                  return (
                    <Link
                      key={t.href}
                      href={t.href}
                      aria-current={on ? "page" : undefined}
                      className={cn(
                        "relative inline-flex h-10 items-center px-4 text-sm font-semibold transition-colors",
                        on ? "text-ink" : "text-muted hover:text-ink",
                      )}
                    >
                      {t.label}
                      {on && (
                        <motion.span layoutId="nav-underline" className="absolute inset-x-4 -bottom-1 h-0.5 rounded-full bg-ink" transition={{ type: "spring", stiffness: 500, damping: 38 }} />
                      )}
                    </Link>
                  );
                })}
                <Link href="/business" className="group inline-flex h-10 items-center gap-2 px-4 text-sm font-semibold text-muted transition-colors hover:text-ink">
                  Chris
                  <span className="rounded bg-ink px-1.5 py-0.5 text-xs font-bold tracking-wider text-paper uppercase transition group-hover:-translate-y-px">
                    for Business
                  </span>
                </Link>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link href="/about" className={buttonClass("tertiary", "hidden lg:inline-flex")} aria-current={pathname.startsWith("/about") ? "page" : undefined}>
            About me
          </Link>
          <Link href="/about#contact" className={buttonClass("primary", "hidden sm:inline-flex")}>
            Let&apos;s talk
          </Link>
          <SiteMenu email={email} linkedIn={linkedIn} calendly={calendly} enterpriseUrl={enterpriseUrl} />
        </div>
      </div>
    </header>
  );
}
