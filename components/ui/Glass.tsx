"use client";

import GlassSurface from "@/components/reactbits/GlassSurface";

export type GlassVariant = "primary" | "secondary";

/**
 * React Bits GlassSurface as a button's background. Drop it in as the first child of a
 * button or link styled with glassButtonClass(): it fills the button, sits behind the
 * label, and bends whatever is behind the button at its edges.
 * primary = smoky dark glass with white text, secondary = clear glass with black text.
 */
export function GlassFill({ variant = "secondary", radius = 999 }: { variant?: GlassVariant; radius?: number }) {
  const dark = variant === "primary";
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
      backgroundOpacity={dark ? 0.8 : 0.35}
      className={`pointer-events-none absolute inset-0 -z-1 ${dark ? "glass-scheme-dark" : "glass-scheme-light"}`}
    />
  );
}
