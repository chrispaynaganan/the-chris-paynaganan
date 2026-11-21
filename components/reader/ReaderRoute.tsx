"use client";

import { useRouter } from "next/navigation";
import { PdfReader } from "./PdfReader";

/** /projects/[slug]/documentation opened straight from a link: the reader opens at once, and closing it goes to the project. */
export function ReaderRoute({ src, title, backHref }: { src: string; title: string; backHref: string }) {
  const router = useRouter();
  return <PdfReader open onClose={() => router.push(backHref)} src={src} title={title} />;
}
