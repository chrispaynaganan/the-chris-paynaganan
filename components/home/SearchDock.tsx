"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ProjectStatus } from "@/types/content";

export type SearchProject = { slug: string; name: string; kind: string; category: string; platform: string; status: ProjectStatus; tags: string[] };

// Shared by the big search on the home page and the one in the header, so both
// drive the same results: the text, the category and the "Shipped only" switch.
type Dock = {
  projects: SearchProject[];
  docked: boolean;
  setDocked: (v: boolean) => void;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  query: string;
  setQuery: (v: string) => void;
  cat: string;
  setCat: (v: string) => void;
  liveOnly: boolean;
  setLiveOnly: (v: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  showResults: () => void;
};

const DockContext = createContext<Dock | null>(null);

export function useSearchDock() {
  const ctx = useContext(DockContext);
  if (!ctx) throw new Error("useSearchDock needs <SearchDockProvider>");
  return ctx;
}

export function SearchDockProvider({ projects, children }: { projects: SearchProject[]; children: React.ReactNode }) {
  const [docked, setDocked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [liveOnly, setLiveOnly] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  /** Close the header search and bring the results grid into view. */
  const showResults = useCallback(() => {
    setExpanded(false);
    document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <DockContext.Provider
      value={{ projects, docked, setDocked, expanded, setExpanded, query, setQuery, cat, setCat, liveOnly, setLiveOnly, inputRef, showResults }}
    >
      {children}
    </DockContext.Provider>
  );
}
