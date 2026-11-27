import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

/** Home link: your photo from Studio (Profile → Your photo) in the badge, or "CP" until there is one. */
export function Logo({ dark = false, business = false, photoUrl }: { dark?: boolean; business?: boolean; photoUrl?: string }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Chris Paynaganan, home">
      <span
        className={cn(
          "relative flex size-8 items-center justify-center overflow-hidden rounded-lg text-sm font-medium",
          dark ? "bg-paper text-ink" : "bg-ink text-paper",
        )}
      >
        {photoUrl ? <Image src={photoUrl} alt="" fill sizes="32px" className="object-cover" priority /> : "CP"}
      </span>
      <span className={cn("text-lg font-semibold tracking-tight", dark ? "text-paper" : "text-ink")}>Chris Paynaganan</span>
      {business && (
        <span className="rounded bg-paper px-1.5 py-0.5 text-xs font-medium tracking-wider text-ink uppercase">for Business</span>
      )}
    </Link>
  );
}
