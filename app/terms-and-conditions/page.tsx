import type { Metadata } from "next";
import { Notice } from "@/components/ui/Notice";

export const metadata: Metadata = { title: "Terms and conditions" };

export default function Page() {
  return (
    <main className="mx-auto flex max-w-site flex-col gap-6 px-gutter pt-12 pb-20">
      <h1 className="text-3xl font-extrabold tracking-tight">Terms and conditions</h1>
      <Notice tone="info">This page is moving over from the old site.</Notice>
    </main>
  );
}
