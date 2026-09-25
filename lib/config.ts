import "server-only";

/**
 * Single source of truth for every secret, endpoint and resource name.
 * Values are read from process.env (see .env.example) and validated here only.
 *
 * Required:
 *   GEMINI_API_KEY          string   Google Gemini API key (server only)
 *   PROJECT_URL             url      https://<ref>.supabase.co
 *   PUBLISHABLE_KEY         string   Supabase publishable key (public, inert under RLS)
 *   SUPABASE_SECRET_KEY     string   Supabase secret key (server only; all writes + uploads)
 *   ADMIN_ID                string   Login id
 *   ADMIN_PASSWORD          string   Login password
 *   SESSION_SECRET          string   >= 32 chars, HMAC key for the session cookie
 *
 * Optional (defaults):
 *   LLM_MODEL               "gemini-3.5-flash-lite"
 *   SUPABASE_PRODUCTS_TABLE "products"
 *   SUPABASE_STORAGE_BUCKET "product-images"
 *   CONNECTION_STRING       unused at runtime (migrations / SQL only)
 *   WHATSAPP_NUMBER         unset => WhatsApp enquiry buttons hidden. e.g. +919876543210
 */

export class ConfigError extends Error {
  constructor(public readonly missing: string[], section: string) {
    super(
      `\n\n  Rangriti Studio — configuration incomplete (${section}).\n` +
        `  Missing or invalid: ${missing.join(", ")}\n` +
        `  Add them to .env.local (see .env.example) and restart the server.\n`,
    );
    this.name = "ConfigError";
  }
}

function read(name: string): string | undefined {
  const v = process.env[name];
  if (v === undefined) return undefined;
  const t = v.trim();
  return t.length ? t : undefined;
}

function isUrl(v: string | undefined): boolean {
  if (!v) return false;
  try {
    return /^https?:$/.test(new URL(v).protocol);
  } catch {
    return false;
  }
}

function collect<T extends Record<string, string | undefined>>(
  section: string,
  values: T,
  checks: Partial<Record<keyof T, (v: string | undefined) => boolean>> = {},
): { [K in keyof T]: string } {
  const missing = Object.entries(values)
    .filter(([k, v]) => {
      const check = checks[k as keyof T];
      return check ? !check(v) : !v;
    })
    .map(([k]) => k);
  if (missing.length) throw new ConfigError(missing, section);
  return values as { [K in keyof T]: string };
}

export type LlmConfig = { apiKey: string; model: string };
export type SupabaseConfig = {
  url: string;
  publishableKey: string;
  secretKey: string;
  productsTable: string;
  storageBucket: string;
};
export type AuthConfig = { adminId: string; adminPassword: string; sessionSecret: string };

export function llmConfig(): LlmConfig {
  const v = collect("LLM", { GEMINI_API_KEY: read("GEMINI_API_KEY") });
  return { apiKey: v.GEMINI_API_KEY, model: read("LLM_MODEL") ?? "gemini-3.5-flash-lite" };
}

export function supabaseConfig(): SupabaseConfig {
  const v = collect(
    "Supabase",
    {
      PROJECT_URL: read("PROJECT_URL"),
      PUBLISHABLE_KEY: read("PUBLISHABLE_KEY"),
      SUPABASE_SECRET_KEY: read("SUPABASE_SECRET_KEY"),
    },
    { PROJECT_URL: isUrl },
  );
  return {
    url: v.PROJECT_URL.replace(/\/+$/, ""),
    publishableKey: v.PUBLISHABLE_KEY,
    secretKey: v.SUPABASE_SECRET_KEY,
    productsTable: read("SUPABASE_PRODUCTS_TABLE") ?? "products",
    storageBucket: read("SUPABASE_STORAGE_BUCKET") ?? "product-images",
  };
}

export function authConfig(): AuthConfig {
  const v = collect(
    "Admin",
    {
      ADMIN_ID: read("ADMIN_ID"),
      ADMIN_PASSWORD: read("ADMIN_PASSWORD"),
      SESSION_SECRET: read("SESSION_SECRET"),
    },
    { SESSION_SECRET: (s) => !!s && s.length >= 32 },
  );
  return { adminId: v.ADMIN_ID, adminPassword: v.ADMIN_PASSWORD, sessionSecret: v.SESSION_SECRET };
}

export type StoreConfig = { whatsappNumber: string | null };

/**
 * Optional storefront settings. WHATSAPP_NUMBER may include +, spaces or dashes; it is
 * reduced to digits for wa.me. A bare 10-digit number is treated as Indian (+91).
 * If unset or invalid, WhatsApp enquiry buttons are simply hidden.
 */
export function storeConfig(): StoreConfig {
  const raw = read("WHATSAPP_NUMBER");
  if (!raw) return { whatsappNumber: null };
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`;
  if (digits.length < 11 || digits.length > 15) {
    console.warn("[config] WHATSAPP_NUMBER is not a valid international number; WhatsApp enquiries disabled.");
    return { whatsappNumber: null };
  }
  return { whatsappNumber: digits };
}

/** Validate every section at once; used at server startup (instrumentation.ts). */
export function validateAllConfig(): void {
  const missing: string[] = [];
  for (const fn of [llmConfig, supabaseConfig, authConfig]) {
    try {
      fn();
    } catch (e) {
      if (e instanceof ConfigError) missing.push(...e.missing);
      else throw e;
    }
  }
  if (missing.length) throw new ConfigError(missing, "startup");
}
