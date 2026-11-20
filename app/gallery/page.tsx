import type { Metadata } from "next";
import { getSite } from "@/lib/content";
import { GalleryGrid } from "./GalleryGrid";

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const site = await getSite();
  return (
    <main className="mx-auto flex max-w-site animate-fade-in flex-col gap-6 px-gutter pt-10 pb-20">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium tracking-wider text-muted uppercase">Gallery</span>
        <h1 className="text-3xl font-semibold tracking-tight">Designing out of curiosity.</h1>
        <p className="max-w-2xl text-xl">My mood board. Ideas I wanted to try, whether or not they ever get built.</p>
      </div>
      <GalleryGrid items={site.gallery} />
    </main>
  );
}
