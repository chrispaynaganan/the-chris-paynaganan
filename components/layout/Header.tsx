"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Menu as GlassMenu } from "glisse";
import { Menu as MenuIcon, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonClass } from "@/components/ui/button";
import { useSearchDock } from "@/components/home/SearchDock";
import { SearchSuggestions } from "@/components/home/SearchSuggestions";
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

function SiteMenu({ linkedIn, calendly, enterpriseUrl, resumeUrl }: { linkedIn: string; calendly: string; enterpriseUrl: string; resumeUrl?: string }) {
  const router = useRouter();
  const open = (url: string) => window.open(url, "_blank", "noopener");
  return (
    <GlassMenu
      aria-label="Site menu"
      align="end"
      icon={<MenuIcon aria-hidden className="size-4.5" />}
      items={[
        { label: "About me", onSelect: () => router.push("/about") },
        { label: "Niches I’ve explored", onSelect: () => router.push("/#niches") },
        { label: "Gallery", onSelect: () => router.push("/gallery") },
        "separator",
        { label: "Contact", onSelect: () => router.push("/contact") },
        { label: "Book a virtual coffee", onSelect: () => open(calendly) },
        ...(resumeUrl ? [{ label: "Résumé", onSelect: () => open(resumeUrl) }] : []),
        { label: "LinkedIn", onSelect: () => open(linkedIn) },
        "separator",
        { label: "Chris for Business", onSelect: () => router.push("/business") },
        "separator",
        { label: "Chris Enterprise", onSelect: () => open(enterpriseUrl) },
      ]}
    />
  );
}

export function Header({
  linkedIn,
  calendly,
  enterpriseUrl,
  resumeUrl,
}: {
  linkedIn: string;
  calendly: string;
  enterpriseUrl: string;
  resumeUrl?: string;
}) {
  const pathname = usePathname();
  const scrolled = useScrolled();
  const { docked, query, setQuery, expanded, setExpanded, showResults } = useSearchDock();
  const isBusiness = pathname.startsWith("/business");
  const showDock = pathname === "/" && docked;
  const isOpen = expanded && pathname === "/";

  // Escape closes the expanded search
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setExpanded(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, setExpanded]);

  if (isBusiness) {
    return (
      <header style={{ viewTransitionName: "site-header" }} className={cn("sticky top-0 z-30 border-b bg-ink text-paper transition duration-300", scrolled ? "border-paper/15" : "border-transparent")}>
        <div className="mx-auto flex max-w-site flex-wrap items-center justify-between gap-4 px-gutter py-2">
          <Logo dark business />
          <nav aria-label="Business sections" className="hidden flex-wrap gap-5 text-sm font-medium md:flex">
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
            <Link href="/" transitionTypes={["nav-back"]} className="text-sm font-medium text-paper underline underline-offset-4 hover:decoration-2">
              Back to projects
            </Link>
            <a href="#inquire" className="inline-flex h-10 items-center rounded-lg bg-paper px-4 text-sm font-medium text-ink transition hover:bg-placeholder-alt active:scale-97">
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
        scrolled ? "border-transparent shadow-float" : "border-line",
      )}
    >
      <div className="mx-auto grid max-w-site grid-cols-2 items-center gap-4 px-gutter py-2 md:grid-cols-3">
        <Logo />

        <div className="relative hidden min-h-10 items-center justify-center md:flex">
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <div key="open" className="absolute top-1/2 left-1/2 z-10 w-xs -translate-x-1/2 -translate-y-1/2 lg:w-md xl:w-xl">
                <motion.div
                  layoutId="header-search"
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  className="flex h-10 items-center rounded-full border border-line-strong bg-paper py-1 pr-1 pl-4 shadow-float"
                >
                  <label htmlFor="header-search-input" className="sr-only">
                    Search the diary
                  </label>
                  <Search aria-hidden className="mr-2.5 size-4 shrink-0 text-muted" />
                  <input
                    id="header-search-input"
                    autoFocus
                    type="text"
                    inputMode="search"
                    enterKeyHint="search"
                    autoComplete="off"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && showResults()}
                    placeholder="Search the diary: project, industry or platform"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
                  />
                  <button type="button" onClick={() => setExpanded(false)} aria-label="Close search" className="mx-1 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition hover:bg-surface">
                    <X aria-hidden className="size-4" />
                  </button>
                  <button type="button" onClick={showResults} className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-ink px-3.5 text-sm font-medium text-paper transition active:scale-97">
                    Search
                  </button>
                </motion.div>
              </div>
            ) : showDock ? (
              <motion.button
                key="dock"
                layoutId="header-search"
                type="button"
                onClick={() => setExpanded(true)}
                aria-expanded={isOpen}
                initial={{ opacity: 0, y: 14, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.92 }}
                transition={{ duration: 0.28, ease }}
                className="flex h-10 cursor-pointer items-center gap-3 rounded-full border border-line-strong py-1 pr-1 pl-4 text-sm font-medium shadow-float transition-shadow"
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
                        "relative inline-flex h-10 items-center px-4 text-sm font-medium transition-colors",
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
                <Link href="/business" className="group inline-flex h-10 items-center gap-2 px-4 text-sm font-medium text-muted transition-colors hover:text-ink">
                  Chris
                  <span className="rounded bg-ink px-1.5 py-0.5 text-xs font-medium tracking-wider text-paper uppercase transition group-hover:-translate-y-px">
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
          <Link href="/contact" className={buttonClass("primary", "hidden sm:inline-flex")} aria-current={pathname.startsWith("/contact") ? "page" : undefined}>
            Let&apos;s talk
          </Link>
          <SiteMenu linkedIn={linkedIn} calendly={calendly} enterpriseUrl={enterpriseUrl} resumeUrl={resumeUrl} />
        </div>
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                key="search-backdrop"
                aria-hidden
                onClick={() => setExpanded(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-20 bg-ink/25"
              />
            )}
          </AnimatePresence>,
          document.body,
        )}
      {/* Suggestions float below the header as a card; the header itself stays the same height */}
      <AnimatePresence>
        {isOpen && (
          <div className="pointer-events-none absolute inset-x-0 top-full flex justify-center px-gutter pt-3">
            <div className="pointer-events-auto w-full max-w-3xl">
              <SearchSuggestions id="header-suggestions" onDone={showResults} />
            </div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
