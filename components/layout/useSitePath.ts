"use client";

import { usePathname } from "next/navigation";

/**
 * usePathname, with the home page always reported as "/".
 * When Vercel re-renders the home page in the background it can see "/index",
 * which made the server and browser disagree about the active tab.
 */
export function useSitePath() {
  const path = usePathname() ?? "/";
  if (path === "/index") return "/";
  return path.endsWith("/index") ? path.slice(0, -"/index".length) : path;
}
