import type { Metadata } from "next";
import { InquiriesBoard } from "@/components/studio/InquiriesBoard";

export const metadata: Metadata = { title: "Inquiries" };

export default function Page() {
  return <InquiriesBoard />;
}
