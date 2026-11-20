import type { Metadata } from "next";
import { getProjects } from "@/lib/content";
import { SavedList } from "./SavedList";

export const metadata: Metadata = { title: "Saved projects" };

export default async function SavedPage() {
  const projects = await getProjects();
  return (
    <main className="mx-auto flex max-w-site flex-col gap-8 px-gutter pt-12 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Saved</h1>
        <p className="text-body">Projects you hearted, kept in this browser.</p>
      </div>
      <SavedList projects={projects} />
    </main>
  );
}
