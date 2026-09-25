import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin, UnauthorizedError } from "@/lib/auth/session";
import { LIMITS } from "@/lib/constants";
import { extractProduct, ExtractionError } from "@/lib/llm/adapter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const body = z.object({ raw: z.string().trim().min(10).max(LIMITS.rawInputMaxChars) });

export async function POST(req: Request) {
  try {
    await assertAdmin();
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw e;
  }

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: `Paste between 10 and ${LIMITS.rawInputMaxChars} characters of product text.` },
      { status: 400 },
    );
  }

  try {
    const extraction = await extractProduct(parsed.data.raw);
    return NextResponse.json({ extraction });
  } catch (e) {
    if (e instanceof ExtractionError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("[extract]", e);
    return NextResponse.json({ error: "Extraction failed." }, { status: 500 });
  }
}
