"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { Play } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { StoryViewer } from "./StoryViewer";
import type { StoryProject } from "./types";

/** "Watch the story" on a project page; plays this project, then carries on to the next. */
export function StoryButton({ projects, start }: { projects: StoryProject[]; start: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClass("secondary")}>
        <Play aria-hidden className="size-4" /> Watch the 30-second story
      </button>
      <AnimatePresence>{open && <StoryViewer projects={projects} start={start} onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}
