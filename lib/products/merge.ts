import type { Category, Currency } from "../constants";
import type { Extraction } from "../llm/extraction-schema";

export type FormValues = {
  title: string;
  category: Category | "";
  fabric: string;
  description: string;
  sizes: string[];
  price: string;
  currency: Currency;
  free_shipping: boolean;
  ready_to_ship: boolean;
};

export type FieldKey = keyof FormValues;
export type Sources = Partial<Record<FieldKey, "llm" | "manual">>;

export const FIELD_ORDER: FieldKey[] = [
  "title",
  "category",
  "fabric",
  "description",
  "sizes",
  "price",
  "currency",
  "free_shipping",
  "ready_to_ship",
];

export const FIELD_LABELS: Record<FieldKey, string> = {
  title: "Title",
  category: "Category",
  fabric: "Fabric",
  description: "Description",
  sizes: "Sizes",
  price: "Price",
  currency: "Currency",
  free_shipping: "Free shipping",
  ready_to_ship: "Ready to dispatch",
};

/** Only confidently-present (non-null / non-empty) values become a patch. */
export function extractionToPatch(ex: Extraction): Partial<FormValues> {
  const p: Partial<FormValues> = {};
  if (ex.title) p.title = ex.title;
  if (ex.category) p.category = ex.category;
  if (ex.fabric) p.fabric = ex.fabric;
  if (ex.description) p.description = ex.description;
  if (ex.sizes.length) p.sizes = ex.sizes;
  if (ex.price != null) {
    p.price = String(ex.price);
    if (ex.currency) p.currency = ex.currency;
  }
  if (ex.free_shipping != null) p.free_shipping = ex.free_shipping;
  if (ex.ready_to_ship != null) p.ready_to_ship = ex.ready_to_ship;
  return p;
}

function same(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => String(v).toLowerCase() === String(b[i]).toLowerCase());
  }
  return typeof a === "string" && typeof b === "string" ? a.trim() === b.trim() : a === b;
}

function isBlank(v: unknown): boolean {
  return v === "" || (Array.isArray(v) && v.length === 0);
}

/** Fields the user typed by hand that the patch would overwrite with a different value. */
export function findConflicts(values: FormValues, sources: Sources, patch: Partial<FormValues>): FieldKey[] {
  return FIELD_ORDER.filter(
    (k) => k in patch && sources[k] === "manual" && !isBlank(values[k]) && !same(values[k], patch[k]),
  );
}
