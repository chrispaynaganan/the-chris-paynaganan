import type { Metadata } from "next";
import { getLegal } from "@/lib/content";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Terms and conditions" };

export default async function Page() {
  const doc = await getLegal("terms");
  return <LegalPage doc={doc} other={{ label: "Read the privacy policy", href: "/privacy-policy" }} />;
}
