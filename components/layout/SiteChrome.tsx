import { getProjects, getSite } from "@/lib/content";
import { SearchDockProvider } from "@/components/home/SearchDock";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileTabBar } from "./MobileTabBar";

/** The public site's header, footer and phone tab bar around a page. Studio doesn't use it. */
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const [site, projects] = await Promise.all([getSite(), getProjects()]);
  const searchProjects = projects.map(({ slug, name, kind, category, platform, status, tags, stamps }) => ({ slug, name, kind, category, platform, status, tags, stamps }));
  return (
    <SearchDockProvider projects={searchProjects}>
      <Header
        calendly={site.calendlyUrl}
        resumeUrl={site.resumeUrl}
        photoUrl={site.photoUrl}
        enterpriseUrl={site.enterprise.url}
        linkedIn={site.socials.find((s) => s.label === "LinkedIn")?.url ?? ""}
      />
      <div className="flex-1 pb-24 md:pb-0">{children}</div>
      <Footer />
      <MobileTabBar />
    </SearchDockProvider>
  );
}
