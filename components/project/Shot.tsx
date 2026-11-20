import { cn } from "@/lib/cn";
import type { Screenshot } from "@/types/content";
import { ShotImage } from "./ShotImage";

/** A screenshot, or a labelled grey placeholder until one is uploaded. */
export function Shot({ shot, name, alt, className, big }: { shot: Screenshot; name?: string; alt?: boolean; className?: string; big?: boolean }) {
  if (shot.src) {
    return <ShotImage src={shot.src} alt={`${name ?? ""} ${shot.label}`.trim()} className={className} />;
  }
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 p-5 text-center", alt ? "bg-placeholder-alt" : "bg-placeholder", className)}>
      {name && <span className={cn("font-medium tracking-tight", big ? "text-4xl" : "text-2xl")}>{name}</span>}
      <span className="text-xs text-muted">[Screenshot · {shot.label}]</span>
    </div>
  );
}
