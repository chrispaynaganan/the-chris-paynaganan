// Monday-style label colors, as full class names so Tailwind picks them up.
export type StudioColor = "green" | "orange" | "red" | "blue" | "purple" | "lime" | "grey" | "dark";

export const fill: Record<StudioColor, string> = {
  green: "bg-studio-green text-paper",
  orange: "bg-studio-orange text-paper",
  red: "bg-studio-red text-paper",
  blue: "bg-studio-blue text-paper",
  purple: "bg-studio-purple text-paper",
  lime: "bg-studio-lime text-paper",
  grey: "bg-studio-grey text-paper",
  dark: "bg-studio-dark text-paper",
};

export const text: Record<StudioColor, string> = {
  green: "text-studio-green",
  orange: "text-studio-orange",
  red: "text-studio-red",
  blue: "text-studio-blue",
  purple: "text-studio-purple",
  lime: "text-studio-lime",
  grey: "text-studio-muted",
  dark: "text-studio-dark",
};

export const bar: Record<StudioColor, string> = {
  green: "bg-studio-green",
  orange: "bg-studio-orange",
  red: "bg-studio-red",
  blue: "bg-studio-blue",
  purple: "bg-studio-purple",
  lime: "bg-studio-lime",
  grey: "bg-studio-grey",
  dark: "bg-studio-dark",
};

export type Label = { value: string; label: string; color: StudioColor };
