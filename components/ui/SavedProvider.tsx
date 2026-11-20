"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

// Hearted projects, remembered in this browser only.
const KEY = "cp-saved-projects";
const SavedContext = createContext<{ saved: string[]; toggle: (slug: string) => boolean }>({
  saved: [],
  toggle: () => false,
});

export function useSaved() {
  return useContext(SavedContext);
}

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser storage once after mount
      if (raw) setSaved(JSON.parse(raw));
    } catch {
      // storage can be blocked; hearts then last for this visit only
    }
  }, []);

  const toggle = useCallback((slug: string) => {
    let nowSaved = false;
    setSaved((prev) => {
      nowSaved = !prev.includes(slug);
      const next = nowSaved ? [...prev, slug] : prev.filter((s) => s !== slug);
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    return nowSaved;
  }, []);

  return <SavedContext.Provider value={{ saved, toggle }}>{children}</SavedContext.Provider>;
}
