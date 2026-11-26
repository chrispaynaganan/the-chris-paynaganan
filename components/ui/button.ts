import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "tertiary";

/**
 * The three button styles used everywhere:
 * primary = filled black, secondary = black outline, tertiary = underlined text.
 */
/** `onDark` switches to the inverted style used on black backgrounds. */
export function buttonClass(variant: ButtonVariant = "primary", className?: string, onDark = false) {
  const base =
    "inline-flex cursor-pointer items-center justify-center gap-2 text-sm font-medium transition duration-200 active:scale-97 disabled:cursor-not-allowed disabled:opacity-50";
  const variants: Record<ButtonVariant, string> = {
    primary: "h-10 rounded-full bg-ink px-4 text-paper hover:bg-ink-soft lg:h-9",
    secondary: "h-10 rounded-full border border-ink bg-paper px-4 text-ink hover:bg-surface lg:h-9",
    tertiary: "text-ink underline underline-offset-4 hover:decoration-2",
  };
  const dark: Record<ButtonVariant, string> = {
    primary: "h-10 rounded-lg bg-paper px-4 text-ink hover:bg-placeholder-alt",
    secondary: "h-10 rounded-lg border border-paper bg-transparent px-4 text-paper hover:bg-paper/10",
    tertiary: "text-paper underline underline-offset-4 hover:decoration-2",
  };
  return cn(base, onDark ? dark[variant] : variants[variant], className);
}

/** Classes for a glass button. Pair with <GlassFill variant={…} /> as its first child. */
export function glassButtonClass(variant: "primary" | "secondary" = "primary", className?: string) {
  return cn(
    "relative isolate inline-flex h-10 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full px-4 lg:h-9 text-sm font-medium transition duration-200 active:scale-97 disabled:cursor-not-allowed disabled:opacity-50",
    variant === "primary" ? "text-ink hover:bg-paper/60" : "text-ink hover:bg-paper/60",
    className,
  );
}
