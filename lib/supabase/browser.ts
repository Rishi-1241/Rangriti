"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Unprivileged browser client (publishable key). RLS is on with no policies, so this
 * client can do nothing privileged by design. The app stores full public URLs, so it
 * is not needed for rendering — it exists only for public URL helpers.
 * PROJECT_URL / PUBLISHABLE_KEY are mapped to NEXT_PUBLIC_* in next.config.ts.
 */
let client: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_PROJECT_URL;
  const key = process.env.NEXT_PUBLIC_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("PROJECT_URL / PUBLISHABLE_KEY are not configured.");
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export function publicImageUrl(bucket: string, path: string): string {
  return supabaseBrowser().storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
