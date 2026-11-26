"use client";

import GlassSurface from "@/components/reactbits/GlassSurface";

export type GlassVariant = "primary" | "secondary";

/**
 * React Bits GlassSurface as a button's background. Drop it in as the first child of a
 * button or link styled with glassButtonClass(): it fills the button, sits behind the
 * label, and bends whatever is behind the button at its edges.
 * The portfolio is light, so the glass is always clear; the primary button gets a thin
 * black rim to tell it apart. Darker glass is kept for the black business page.
 */
export function GlassFill({ variant = "secondary", radius = 999 }: { variant?: GlassVariant; radius?: number }) {
  return (
    <GlassSurface
      width="100%"
      height="100%"
      borderRadius={radius}
      distortionScale={-60}
      redOffset={0}
      greenOffset={0}
      blueOffset={0}
      borderWidth={0.12}
      displace={0.5}
      brightness={50}
      opacity={0.93}
      saturation={1.4}
      backgroundOpacity={0.55}
      // shadow-glass swaps the component's grey inner shading for a bright rim and a soft lift.
      // The primary rim is drawn on the glass itself, so the glass doesn't bend it into smudges.
      className={`glass-scheme-light pointer-events-none absolute inset-0 -z-1 shadow-glass ${variant === "primary" ? "ring-1 ring-ink/80 ring-inset" : ""}`}
    />
  );
}
