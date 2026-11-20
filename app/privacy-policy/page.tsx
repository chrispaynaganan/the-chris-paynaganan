import type { Metadata } from "next";
import { Notice } from "@/components/ui/Notice";

export const metadata: Metadata = { title: "Privacy policy" };

export default function Page() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 pt-12 pb-20 md:px-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Privacy policy</h1>
      <Notice tone="info">This page is moving over from the old site.</Notice>
    </main>
  );
}
