"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin, UnauthorizedError } from "@/lib/auth/session";
import { productInputSchema } from "@/lib/products/schema";
import { deleteProduct, insertProduct, updateProduct } from "@/lib/products/repo";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function fail(e: unknown): { ok: false; error: string } {
  if (e instanceof UnauthorizedError) return { ok: false, error: "Your session has ended. Please sign in again." };
  console.error("[products action]", e);
  return { ok: false, error: e instanceof Error ? e.message : "Something went wrong." };
}

export async function saveProductAction(
  id: string | null,
  payload: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await assertAdmin();
    const parsed = productInputSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        fieldErrors[key] ??= issue.message;
      }
      return { ok: false, error: "Please review the highlighted fields.", fieldErrors };
    }
    const row = id ? await updateProduct(id, parsed.data) : await insertProduct(parsed.data);
    revalidatePath("/");
    revalidatePath(`/products/${row.id}`);
    revalidatePath("/studio");
    revalidatePath(`/studio/${row.id}`);
    return { ok: true, data: { id: row.id } };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  try {
    await assertAdmin();
    const valid = z.uuid().safeParse(id);
    if (!valid.success) return { ok: false, error: "Invalid product id." };
    await deleteProduct(valid.data);
    revalidatePath("/");
    revalidatePath("/studio");
    return { ok: true, data: undefined };
  } catch (e) {
    return fail(e);
  }
}
