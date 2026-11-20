import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { Header } from "@/components/layout/Header";
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`}>
      <body className="flex min-h-screen flex-col">
        <ToastProvider>
          <SavedProvider>
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </SavedProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
