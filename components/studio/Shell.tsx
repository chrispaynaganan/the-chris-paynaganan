"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Briefcase, FolderKanban, Inbox, LayoutTemplate, LogOut } from "lucide-react";
import { cn } from "@/lib/cn";
import { studioClient } from "@/lib/supabase/browser";

const boards = [
  { href: "/studio/projects", label: "Projects", icon: FolderKanban },
  { href: "/studio/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/studio/business", label: "Business", icon: Briefcase },
  { href: "/studio/site", label: "Site & About", icon: LayoutTemplate },
];

/** Monday-style frame: top bar, workspace sidebar, and the board on a white sheet. */
export function Shell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const close = (e: PointerEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [menu]);

  const signOut = async () => {
    await studioClient().auth.signOut();
    router.replace("/studio/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-12 shrink-0 items-center justify-between px-4">
        <Link href="/studio/projects" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-studio-primary text-xs font-semibold text-paper">CP</span>
          <span className="font-semibold">Studio</span>
          <span className="text-sm text-studio-muted">· Chris Paynaganan</span>
        </Link>
        <div className="flex items-center gap-2">
          <a href="/" target="_blank" rel="noopener" className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm transition hover:bg-studio-hover">
            View site <ArrowUpRight aria-hidden className="size-3.5" />
          </a>
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenu((m) => !m)}
              aria-expanded={menu}
              aria-label="Account"
              className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-studio-purple text-sm font-medium text-paper"
            >
              C
            </button>
            {menu && (
              <div className="absolute top-full right-0 z-50 mt-2 w-64 rounded-lg border border-studio-line-soft bg-paper p-2 shadow-float">
                <p className="truncate px-2 py-1.5 text-sm text-studio-muted">{email}</p>
                <button type="button" onClick={signOut} className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-sm transition hover:bg-studio-surface">
                  <LogOut aria-hidden className="size-4" /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 gap-2 pr-2 pb-2">
        <nav aria-label="Boards" className="hidden w-60 shrink-0 flex-col gap-1 px-2 pt-2 md:flex">
          <span className="px-3 pb-2 text-xs font-medium tracking-wide text-studio-muted uppercase">Workspace</span>
          {boards.map((b) => {
            const on = pathname.startsWith(b.href);
            return (
              <Link
                key={b.href}
                href={b.href}
                aria-current={on ? "page" : undefined}
                className={cn("flex h-9 items-center gap-2.5 rounded-md px-3 text-sm transition", on ? "bg-studio-selected font-medium text-studio-primary" : "hover:bg-studio-hover")}
              >
                <b.icon aria-hidden className="size-4" /> {b.label}
              </Link>
            );
          })}
        </nav>
        <main className="min-w-0 flex-1 rounded-tl-lg rounded-tr-lg bg-paper md:rounded-lg">
          {/* Phones: boards as tabs */}
          <nav aria-label="Boards" className="flex gap-1 overflow-x-auto border-b border-studio-line-soft px-3 pt-3 md:hidden">
            {boards.map((b) => (
              <Link key={b.href} href={b.href} className={cn("shrink-0 rounded-md px-3 py-1.5 text-sm", pathname.startsWith(b.href) ? "bg-studio-selected text-studio-primary" : "")}>
                {b.label}
              </Link>
            ))}
          </nav>
          {children}
        </main>
      </div>
    </div>
  );
}
