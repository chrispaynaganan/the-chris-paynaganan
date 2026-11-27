import Image from "next/image";
import { cn } from "@/lib/cn";

/** Chris's photo in a circle, or his initials until one is uploaded in Studio. */
export function HostPhoto({ src, name, className }: { src?: string; name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className={cn("relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-placeholder", className)}>
      {src ? (
        <Image src={src} alt={name} fill sizes="112px" className="object-cover" />
      ) : (
        <span aria-hidden className="text-2xl font-medium text-muted">{initials}</span>
      )}
    </div>
  );
}
