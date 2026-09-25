import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authConfig, ConfigError } from "@/lib/config";
import { SESSION } from "@/lib/constants";
import { signSession, verifySession, type SessionPayload } from "./token";

function secretOrNull(): string | null {
  try {
    return authConfig().sessionSecret;
  } catch (e) {
    if (e instanceof ConfigError) return null;
    throw e;
  }
}

export async function createSessionCookie(sub: string): Promise<void> {
  const token = await signSession(sub, authConfig().sessionSecret, SESSION.maxAgeSeconds);
  const jar = await cookies();
  jar.set(SESSION.cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION.maxAgeSeconds,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION.cookieName);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  return verifySession(jar.get(SESSION.cookieName)?.value, secretOrNull());
}

/** For server components / server actions: redirect to login when unauthenticated. */
export async function requireAdmin(): Promise<SessionPayload> {
  const s = await getSession();
  if (!s) redirect("/login");
  return s;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

/** For route handlers / actions that must return data rather than redirect. */
export async function assertAdmin(): Promise<SessionPayload> {
  const s = await getSession();
  if (!s) throw new UnauthorizedError();
  return s;
}
