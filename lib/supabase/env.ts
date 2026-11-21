export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
/** False until the Supabase settings are in .env.local; the site then runs from the content files. */
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
/** The only account allowed into Studio. Keep in sync with studio_is_owner() in supabase/0001_studio.sql. */
export const STUDIO_OWNER_EMAIL = "mark.payns@gmail.com";
