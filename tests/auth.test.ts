import { test } from "node:test";
import assert from "node:assert/strict";
import { signSession, verifySession } from "../lib/auth/token.ts";
import { safeEqual } from "../lib/auth/safe-equal.ts";

const SECRET = "x".repeat(40);

test("session tokens round-trip and reject tampering", async () => {
  const t = await signSession("admin", SECRET, 60);
  assert.equal((await verifySession(t, SECRET))?.sub, "admin");
  assert.equal(await verifySession(t, "y".repeat(40)), null);
  const [body, sig] = t.split(".");
  assert.equal(await verifySession(`${body}x.${sig}`, SECRET), null);
  assert.equal(await verifySession(undefined, SECRET), null);
  assert.equal(await verifySession(t, null), null);
});

test("expired sessions are rejected", async () => {
  const t = await signSession("admin", SECRET, -1);
  assert.equal(await verifySession(t, SECRET), null);
});

test("safeEqual trims, compares exactly, fails closed on empty", () => {
  assert.equal(safeEqual("secret", "secret\n"), true);
  assert.equal(safeEqual(" secret ", "secret"), true);
  assert.equal(safeEqual("secre", "secret"), false);
  assert.equal(safeEqual("Secret", "secret"), false);
  assert.equal(safeEqual("", ""), false);
});
