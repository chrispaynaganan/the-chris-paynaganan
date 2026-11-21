"use server";

import { revalidatePath } from "next/cache";
import { isOwner } from "@/lib/supabase/server";

/** After a save in Studio: rebuild the public pages so the change shows right away. Owner only. */
export async function refreshSite() {
  if (!(await isOwner())) return { ok: false as const };
  revalidatePath("/", "layout");
  return { ok: true as const };
}
