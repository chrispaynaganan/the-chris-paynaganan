import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ dark = false, business = false }: { dark?: boolean; business?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Chris Paynaganan, home">
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-lg text-sm font-medium",
          dark ? "bg-paper text-ink" : "bg-ink text-paper",
        )}
      >
        CP
      </span>
      <span className={cn("text-lg font-semibold tracking-tight", dark ? "text-paper" : "text-ink")}>Chris Paynaganan</span>
      {business && (
        <span className="rounded bg-paper px-1.5 py-0.5 text-xs font-medium tracking-wider text-ink uppercase">for Business</span>
      )}
    </Link>
  );
}
