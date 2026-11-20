import type { Metadata } from "next";
import { terms } from "@/content/legal";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Terms and conditions" };

export default function Page() {
  return <LegalPage doc={terms} other={{ label: "Read the privacy policy", href: "/privacy-policy" }} />;
}
