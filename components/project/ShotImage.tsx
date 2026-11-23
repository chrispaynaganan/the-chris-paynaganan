"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * A real screenshot: shimmers while loading, then fades in.
 * `eager` is for screenshots that are on screen when the page opens: they load right away
 * and show as soon as they arrive, without waiting for JavaScript to fade them in.
 */
export function ShotImage({
  src,
  alt,
  className,
  eager,
  highPriority,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
  highPriority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const shown = eager || loaded;
  return (
    <div className={cn("relative overflow-hidden", !shown && "shimmer", eager && "bg-placeholder", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        loading={eager ? "eager" : "lazy"}
        fetchPriority={highPriority ? "high" : undefined}
        onLoad={() => setLoaded(true)}
        className={cn("object-cover transition duration-700 ease-soft", shown ? "scale-100 opacity-100" : "scale-102 opacity-0")}
      />
    </div>
  );
}
