import { test } from "node:test";
import assert from "node:assert/strict";
import { extractionToPatch, findConflicts, type FormValues } from "../lib/products/merge.ts";

const base: FormValues = {
  title: "",
  category: "",
  fabric: "",
  description: "",
  sizes: [],
  price: "",
  currency: "INR",
  free_shipping: false,
  ready_to_ship: false,
};

const ex = {
  title: "Ajrakh Dabu Cotton Suit Set",
  category: "Suit Set" as const,
  fabric: null,
  description: null,
  sizes: ["38", "40"],
  price: 1700,
  currency: "INR" as const,
  free_shipping: true,
  ready_to_ship: null,
};

test("patch contains only confident values", () => {
  const p = extractionToPatch(ex);
  assert.deepEqual(Object.keys(p).sort(), ["category", "currency", "free_shipping", "price", "sizes", "title"]);
  assert.equal(p.price, "1700");
});

test("conflicts only for differing manual, non-empty fields", () => {
  const values = { ...base, title: "My title", sizes: ["38", "40"], fabric: "Silk" };
  const sources = { title: "manual", sizes: "manual", fabric: "manual" } as const;
  assert.deepEqual(findConflicts(values, sources, extractionToPatch(ex)), ["title"]);
  assert.deepEqual(findConflicts(values, { title: "llm" }, extractionToPatch(ex)), []);
});
