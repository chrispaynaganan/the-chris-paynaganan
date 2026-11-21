import type { Metadata } from "next";
import { ItemsBoard } from "@/components/studio/ItemsBoard";

export const metadata: Metadata = { title: "Site & About" };

export default function Page() {
  return <ItemsBoard board="site" />;
}
