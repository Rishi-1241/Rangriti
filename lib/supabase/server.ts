import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/lib/config";

let client: SupabaseClient | null = null;

/** Privileged client (secret key). Server-side only — never import from a client component. */
export function supabaseServer(): SupabaseClient {
  if (client) return client;
  const { url, secretKey } = supabaseConfig();
  client = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}

export function tables() {
  const { productsTable, storageBucket } = supabaseConfig();
  return { productsTable, storageBucket };
}
