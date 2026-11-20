import { Cloud, Globe, HeartPulse, LayoutGrid, Mic, Smartphone, Store, UserRound } from "lucide-react";

export const categoryIcons: Record<string, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  all: LayoutGrid,
  web: Globe,
  mobile: Smartphone,
  saas: Cloud,
  health: HeartPulse,
  market: Store,
  portfolio: Mic,
  brand: UserRound,
};
