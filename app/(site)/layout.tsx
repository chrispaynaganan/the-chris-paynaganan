import { SiteChrome } from "@/components/layout/SiteChrome";

// Studio refreshes pages the moment you save; this is a safety net in case that ever fails.
export const revalidate = 300;

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteChrome>{children}</SiteChrome>;
}
