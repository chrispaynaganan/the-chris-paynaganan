"use client";

import { useState } from "react";
import { PdfReader } from "./PdfReader";

/** A button that opens a PDF in the pop-up reader instead of downloading it. */
export function ReaderButton({ src, title, className, children }: { src: string; title: string; className?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <PdfReader open={open} onClose={() => setOpen(false)} src={src} title={title} />
    </>
  );
}
