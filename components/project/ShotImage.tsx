"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

/** A real screenshot: shimmers while loading, then fades in. */
export function ShotImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={cn("relative overflow-hidden", !loaded && "shimmer", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        onLoad={() => setLoaded(true)}
        className={cn("object-cover transition duration-700 ease-soft", loaded ? "scale-100 opacity-100" : "scale-102 opacity-0")}
      />
    </div>
  );
}
