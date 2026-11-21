import type { Metadata } from "next";
import { Livvic } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { SearchDockProvider } from "@/components/home/SearchDock";
import { getProjects, getSite } from "@/lib/content";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const livvic = Livvic({
  subsets: ["latin"],
  // Regular, medium and semibold only. Nothing bolder.
  weight: ["400", "500", "600"],
  variable: "--font-livvic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.chrispaynaganan.com"),
  title: { default: "Chris Paynaganan — Product & Experience Designer", template: "%s · Chris Paynaganan" },
  description:
    "Product & Experience Designer based in Batangas. Healthcare, maritime, coaching and voice projects, written up like diary entries.",
  openGraph: { type: "website", siteName: "Chris Paynaganan", locale: "en_PH" },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [site, projects] = await Promise.all([getSite(), getProjects()]);
  const searchProjects = projects.map(({ slug, name, kind, category, platform, status, tags, stamps }) => ({ slug, name, kind, category, platform, status, tags, stamps }));
  return (
    <html lang="en" data-theme="light" className={livvic.variable}>
      <body className="flex min-h-screen flex-col">
        <ToastProvider>
            <SearchDockProvider projects={searchProjects}>
            <Header
              calendly={site.calendlyUrl}
              resumeUrl={site.resumeUrl}
              enterpriseUrl={site.enterprise.url}
              linkedIn={site.socials.find((s) => s.label === "LinkedIn")?.url ?? ""}
            />
            <div className="flex-1 pb-24 md:pb-0">{children}</div>
            <Footer />
            <MobileTabBar />
            </SearchDockProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
