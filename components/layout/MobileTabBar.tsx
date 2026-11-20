"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TabBar } from "glisse";
import { Briefcase, Images, Search, User } from "lucide-react";

const items = [
  { value: "projects", label: "Projects", href: "/", icon: <Search aria-hidden className="size-5" /> },
  { value: "gallery", label: "Gallery", href: "/gallery", icon: <Images aria-hidden className="size-5" /> },
  { value: "business", label: "Business", href: "/business", icon: <Briefcase aria-hidden className="size-5" /> },
  { value: "about", label: "About", href: "/about", icon: <User aria-hidden className="size-5" /> },
];

function current(pathname: string) {
  if (pathname.startsWith("/gallery")) return "gallery";
  if (pathname.startsWith("/business")) return "business";
  if (pathname.startsWith("/about")) return "about";
  if (pathname === "/") return "projects";
  return null;
}

/** Floating liquid-glass tab bar on phones, like a travel app. Project pages show their own bottom bar instead. */
export function MobileTabBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/projects")) return null;
  return (
    <div style={{ viewTransitionName: "tab-bar" }} className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 md:hidden">
      <TabBar aria-label="Main" items={items} value={current(pathname)} link={Link} />
    </div>
  );
}
