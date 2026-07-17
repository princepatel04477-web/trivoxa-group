import { createClient } from "@supabase/supabase-js";

/** Returns null (not a thrown error) when Supabase credentials aren't configured yet. */
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
