import Image from "next/image";
import { cn } from "@/lib/cn";
import type { Screenshot } from "@/types/content";

/** A screenshot, or a labelled grey placeholder until one is uploaded. */
export function Shot({ shot, name, alt, className, big }: { shot: Screenshot; name?: string; alt?: boolean; className?: string; big?: boolean }) {
  if (shot.src) {
    return (
      <div className={cn("relative", className)}>
        <Image src={shot.src} alt={`${name ?? ""} ${shot.label}`.trim()} fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
      </div>
    );
  }
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 p-5 text-center", alt ? "bg-placeholder-alt" : "bg-placeholder", className)}>
      {name && <span className={cn("font-medium tracking-tight", big ? "text-4xl" : "text-2xl")}>{name}</span>}
      <span className="text-xs text-muted">[Screenshot · {shot.label}]</span>
    </div>
  );
}
