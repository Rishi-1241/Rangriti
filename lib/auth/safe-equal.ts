import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Constant-time string comparison. Both sides are trimmed (so a trailing newline in
 * an env value cannot lock anyone out). The equal-length guard is satisfied by
 * comparing fixed-length SHA-256 digests, so length differences leak no timing and
 * timingSafeEqual never throws; a real length check is still folded into the result.
 */
export function safeEqual(input: string, expected: string): boolean {
  const a = Buffer.from(input.trim(), "utf8");
  const b = Buffer.from(expected.trim(), "utf8");
  if (b.length === 0) return false;
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  const sameLength = a.length === b.length;
  return timingSafeEqual(ha, hb) && sameLength;
}
