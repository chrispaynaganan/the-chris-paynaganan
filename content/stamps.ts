import type { StampDef } from "@/types/content";

// Every area a stamp can be earned in. A stamp is earned when a project lists its id
// in `stamps`. Areas with no project yet show as an open "next destination" slot.
export const stampDefs: StampDef[] = [
  { id: "saas", label: "SaaS", motto: "Product passport", shape: "circle" },
  { id: "healthcare", label: "Healthcare", motto: "Clinics & nurses", shape: "rect" },
  { id: "maritime", label: "Maritime", motto: "Ports & crew", shape: "circle" },
  { id: "marketplace", label: "Marketplaces", motto: "Buyers & sellers", shape: "rect" },
  { id: "coaching", label: "Coaching", motto: "Booked & busy", shape: "circle" },
  { id: "voice", label: "Voice & audio", motto: "Press play", shape: "rect" },
  { id: "creative", label: "Creative portfolios", motto: "Made to be seen", shape: "circle" },
  { id: "fitness", label: "Fitness", motto: "Reps & routines", shape: "rect" },
  { id: "accounting", label: "Accounting", motto: "Books balanced", shape: "circle" },
  { id: "education", label: "Education", motto: "Class in session", shape: "rect" },
  { id: "ecommerce", label: "E-commerce", motto: "Added to bag", shape: "circle" },
];
