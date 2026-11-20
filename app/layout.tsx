import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { SearchDockProvider } from "@/components/home/SearchDock";
import { getSite } from "@/lib/content";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";
import { SavedProvider } from "@/components/ui/SavedProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
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
  const site = await getSite();
  return (
    <html lang="en" data-theme="light" className={`${inter.variable} ${newsreader.variable}`}>
      <body className="flex min-h-screen flex-col">
        <ToastProvider>
          <SavedProvider>
            <SearchDockProvider>
              <Header
                email={site.email}
                calendly={site.calendlyUrl}
                enterpriseUrl={site.enterprise.url}
                linkedIn={site.socials.find((s) => s.label === "LinkedIn")?.url ?? ""}
              />
              <div className="flex-1 pb-24 md:pb-0">{children}</div>
              <Footer />
              <MobileTabBar />
            </SearchDockProvider>
          </SavedProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
