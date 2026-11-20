import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "tertiary";

/**
 * The three button styles used everywhere:
 * primary = filled black, secondary = black outline, tertiary = underlined text.
 */
export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  const base =
    "inline-flex cursor-pointer items-center justify-center gap-2 text-base font-semibold transition duration-200 active:scale-97 disabled:cursor-not-allowed disabled:opacity-50";
  const variants: Record<ButtonVariant, string> = {
    primary: "min-h-12 rounded-xl bg-ink px-5 text-paper hover:bg-ink-soft",
    secondary: "min-h-12 rounded-xl border border-ink bg-paper px-5 text-ink hover:bg-surface",
    tertiary: "min-h-11 px-1 text-ink underline underline-offset-4 hover:decoration-2",
  };
  return cn(base, variants[variant], className);
}
