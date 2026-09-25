// Idempotently creates the PUBLIC product-images bucket using the secret key.
// Usage: npm run setup:storage   (reads .env.local)
import { createClient } from "@supabase/supabase-js";

const url = process.env.PROJECT_URL?.trim();
const key = process.env.SUPABASE_SECRET_KEY?.trim();
const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "product-images";

if (!url || !key) {
  console.error("PROJECT_URL and SUPABASE_SECRET_KEY must be set in .env.local");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });
const { data: existing } = await sb.storage.getBucket(bucket);

if (existing) {
  if (!existing.public) {
    const { error } = await sb.storage.updateBucket(bucket, { public: true });
    if (error) throw error;
    console.log(`Bucket "${bucket}" set to public.`);
  } else {
    console.log(`Bucket "${bucket}" already exists and is public.`);
  }
} else {
  const { error } = await sb.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 8 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  });
  if (error) throw error;
  console.log(`Created public bucket "${bucket}".`);
}
