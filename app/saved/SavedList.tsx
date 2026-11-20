"use client";

import Link from "next/link";
import { useSaved } from "@/components/ui/SavedProvider";
import { ProjectCard } from "@/components/home/ProjectCard";
import { buttonClass } from "@/components/ui/button";
import type { Project } from "@/types/content";

export function SavedList({ projects }: { projects: Project[] }) {
  const { saved, ready } = useSaved();
  const list = projects.filter((p) => saved.includes(p.slug));

  // Shimmering placeholders until the browser's saved list has been read
  if (!ready) {
    return (
      <div aria-busy="true" aria-label="Loading saved projects" className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="shimmer aspect-20/19 rounded-2xl" />
            <div className="shimmer h-4 w-2/3 rounded-full" />
            <div className="shimmer h-4 w-1/2 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 border-t border-line pt-8">
        <h2 className="text-lg font-semibold">No saved projects yet</h2>
        <p className="max-w-lg text-body">As you browse, tap the heart on any project to keep it here for later.</p>
        <Link href="/" className={buttonClass("primary")}>Browse projects</Link>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {list.map((p, i) => (
        <ProjectCard key={p.slug} project={p} index={i} />
      ))}
    </div>
  );
}
