"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

// Hearted projects, remembered in this browser only.
const KEY = "cp-saved-projects";
type Saved = { saved: string[]; ready: boolean; toggle: (slug: string) => boolean };
const SavedContext = createContext<Saved>({ saved: [], ready: false, toggle: () => false });

export function useSaved() {
  return useContext(SavedContext);
}

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const current = useRef<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        current.current = JSON.parse(raw);
        setSaved(current.current);
      }
    } catch {
      // storage can be blocked; hearts then last for this visit only
    }
    setReady(true);
  }, []);

  /** Returns true if the project is now saved. */
  const toggle = useCallback((slug: string) => {
    const nowSaved = !current.current.includes(slug);
    const next = nowSaved ? [...current.current, slug] : current.current.filter((s) => s !== slug);
    current.current = next;
    setSaved(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    return nowSaved;
  }, []);

  return <SavedContext.Provider value={{ saved, ready, toggle }}>{children}</SavedContext.Provider>;
}
