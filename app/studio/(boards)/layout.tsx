import { redirect } from "next/navigation";
import { Shell } from "@/components/studio/Shell";
import { sessionClient } from "@/lib/supabase/server";
import { STUDIO_OWNER_EMAIL, supabaseConfigured } from "@/lib/supabase/env";

// Signed-in owner only (the proxy checks too; this is the second lock).
export const dynamic = "force-dynamic";

export default async function BoardsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!supabaseConfigured) redirect("/studio/login?setup=1");
  const { data } = await (await sessionClient()).auth.getUser();
  const email = data.user?.email?.toLowerCase() ?? "";
  if (email !== STUDIO_OWNER_EMAIL) redirect("/studio/login");
  return <Shell email={email}>{children}</Shell>;
}
