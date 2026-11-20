import type { Metadata } from "next";
import { privacy } from "@/content/legal";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Privacy policy" };

export default function Page() {
  return <LegalPage doc={privacy} other={{ label: "Read the terms and conditions", href: "/terms-and-conditions" }} />;
}
