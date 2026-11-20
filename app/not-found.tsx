import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-start gap-4 px-6 pt-20 pb-24 md:px-10">
      <span className="font-diary text-xl text-muted italic">Dear diary,</span>
      <h1 className="text-4xl font-extrabold tracking-tight">This page isn’t on the map.</h1>
      <p className="text-muted">The link may be old, or the page moved.</p>
      <Link href="/" className={buttonClass("primary")}>Back to projects</Link>
    </main>
  );
}
