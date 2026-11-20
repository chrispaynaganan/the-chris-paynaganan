import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "tertiary";

/**
 * The three button styles used everywhere:
 * primary = filled black, secondary = black outline, tertiary = underlined text.
 */
export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  const base =
    "inline-flex cursor-pointer items-center justify-center gap-2 text-sm font-semibold transition duration-200 active:scale-97 disabled:cursor-not-allowed disabled:opacity-50";
  const variants: Record<ButtonVariant, string> = {
    primary: "h-10 rounded-lg bg-ink px-4 text-paper hover:bg-ink-soft",
    secondary: "h-10 rounded-lg border border-ink bg-paper px-4 text-ink hover:bg-surface",
    tertiary: "text-ink underline underline-offset-4 hover:decoration-2",
  };
  return cn(base, variants[variant], className);
}
