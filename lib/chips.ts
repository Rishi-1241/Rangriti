/**
 * Tokenising helpers for chip/tag inputs. Pure — no imports — so it is unit-testable.
 */

const MULTIWORD: [RegExp, string][] = [
  [/\bfree[\s-]*size\b/gi, "Free Size"],
  [/\bone[\s-]*size\b/gi, "One Size"],
];

const PLACEHOLDER = "\u0000";

/** Split free text ("38 40 42", "S, M, L", "S/M/L") into trimmed tokens. */
export function splitTokens(input: string): string[] {
  const kept: string[] = [];
  let s = input;
  for (const [re, canonical] of MULTIWORD) {
    s = s.replace(re, () => {
      kept.push(canonical);
      return ` ${PLACEHOLDER}${kept.length - 1}${PLACEHOLDER} `;
    });
  }
  return s
    .split(/[\s,;|/]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => {
      const m = t.match(new RegExp(`^${PLACEHOLDER}(\\d+)${PLACEHOLDER}$`));
      return m ? kept[Number(m[1])] : t;
    });
}

/** Canonicalise a size token: letter sizes upper-cased ("xl" -> "XL"), others as-is. */
export function normalizeSize(token: string): string {
  const t = token.trim();
  if (/^(\d?x{0,3}[sml]|\d?x{1,3}l|\d+xl)$/i.test(t)) return t.toUpperCase();
  return t;
}

/** Append tokens to an existing list, de-duplicated case-insensitively, order kept. */
export function mergeUnique(existing: string[], incoming: string[], max = Infinity): string[] {
  const seen = new Set(existing.map((v) => v.toLowerCase()));
  const out = [...existing];
  for (const raw of incoming) {
    const v = raw.trim();
    if (!v) continue;
    const k = v.toLowerCase();
    if (seen.has(k)) continue;
    if (out.length >= max) break;
    seen.add(k);
    out.push(v);
  }
  return out;
}

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
