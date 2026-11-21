import type { Metadata } from "next";
import { ItemsBoard } from "@/components/studio/ItemsBoard";

export const metadata: Metadata = { title: "Business" };

export default function Page() {
  return <ItemsBoard board="business" />;
}
