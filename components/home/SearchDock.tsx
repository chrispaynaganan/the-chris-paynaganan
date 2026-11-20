"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

// Shared between the big search pill on the home page and the compact one that
// slides into the header once the big one scrolls away (as on Airbnb).
type Dock = {
  docked: boolean;
  setDocked: (v: boolean) => void;
  query: string;
  setQuery: (v: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  openSearch: () => void;
};

const DockContext = createContext<Dock | null>(null);

export function useSearchDock() {
  const ctx = useContext(DockContext);
  if (!ctx) throw new Error("useSearchDock needs <SearchDockProvider>");
  return ctx;
}

export function SearchDockProvider({ children }: { children: React.ReactNode }) {
  const [docked, setDocked] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openSearch = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 450);
  }, []);

  return (
    <DockContext.Provider value={{ docked, setDocked, query, setQuery, inputRef, openSearch }}>
      {children}
    </DockContext.Provider>
  );
}
