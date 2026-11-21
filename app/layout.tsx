import type { Metadata } from "next";
import { Livvic } from "next/font/google";
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light" className={livvic.variable}>
      <body className="flex min-h-screen flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
