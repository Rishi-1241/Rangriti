"use server";

import { redirect } from "next/navigation";
import { authConfig } from "@/lib/config";
import { safeEqual } from "@/lib/auth/safe-equal";
import { clearSessionCookie, createSessionCookie } from "@/lib/auth/session";

export type LoginState = { error: string | null; attempt: number };

const GENERIC = "Those credentials were not recognised.";

function safeNext(v: FormDataEntryValue | null): string {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/studio") && !s.startsWith("//") ? s : "/studio";
}

export async function loginAction(prev: LoginState, formData: FormData): Promise<LoginState> {
  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");
  const attempt = prev.attempt + 1;

  let cfg;
  try {
    cfg = authConfig();
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    return { error: "Sign-in is currently unavailable.", attempt };
  }

  // Evaluate both comparisons unconditionally so timing does not reveal which failed.
  const idOk = safeEqual(id, cfg.adminId);
  const pwOk = safeEqual(password, cfg.adminPassword);
  if (!(idOk && pwOk)) {
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 200));
    return { error: GENERIC, attempt };
  }

  await createSessionCookie(cfg.adminId);
  redirect(safeNext(formData.get("next")));
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}
