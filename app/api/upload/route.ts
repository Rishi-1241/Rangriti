import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { assertAdmin, UnauthorizedError } from "@/lib/auth/session";
import { UPLOAD } from "@/lib/constants";
import { supabaseServer, tables } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export async function POST(req: Request) {
  try {
    await assertAdmin();
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw e;
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });
  if (!(UPLOAD.acceptedTypes as readonly string[]).includes(file.type)) {
    return NextResponse.json({ error: "Use JPEG, PNG, WebP or AVIF images." }, { status: 415 });
  }
  if (file.size > UPLOAD.maxBytes) {
    return NextResponse.json(
      { error: `Images must be under ${Math.round(UPLOAD.maxBytes / 1024 / 1024)} MB.` },
      { status: 413 },
    );
  }

  const { storageBucket } = tables();
  const now = new Date();
  const path = `products/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}.${EXT[file.type]}`;
  const storage = supabaseServer().storage.from(storageBucket);

  const { error } = await storage.upload(path, Buffer.from(await file.arrayBuffer()), {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) {
    console.error("[upload]", error.message);
    const msg = /bucket not found/i.test(error.message)
      ? `Storage bucket "${storageBucket}" does not exist. Run "npm run setup:storage".`
      : "Upload failed. Please try again.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const { data } = storage.getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, path });
}
