import { test } from "node:test";
import assert from "node:assert/strict";
import { sortProducts } from "../lib/products/sort.ts";
import { enquiryMessage, whatsappLink } from "../lib/whatsapp.ts";

const items = [
  { title: "Beta", price: 2000, created_at: "2026-01-02" },
  { title: "Alpha", price: null, created_at: "2026-01-03" },
  { title: "Gamma", price: 900, created_at: "2026-01-01" },
];

test("sorts by price with unpriced last", () => {
  assert.deepEqual(sortProducts(items, "price-asc").map((i) => i.title), ["Gamma", "Beta", "Alpha"]);
  assert.deepEqual(sortProducts(items, "price-desc").map((i) => i.title), ["Beta", "Gamma", "Alpha"]);
});

test("sorts by name and newest without mutating input", () => {
  assert.deepEqual(sortProducts(items, "name").map((i) => i.title), ["Alpha", "Beta", "Gamma"]);
  assert.deepEqual(sortProducts(items, "newest").map((i) => i.title), ["Alpha", "Beta", "Gamma"]);
  assert.equal(items[0].title, "Beta");
});

test("builds an encoded wa.me link", () => {
  const msg = enquiryMessage({ title: "Dabu Suit Set", price: 1700, currency: "INR" }, "https://x.test/p/1", "₹1,700");
  assert.match(msg, /more information on this product/);
  const link = whatsappLink("+91 98765 43210", msg);
  assert.ok(link.startsWith("https://wa.me/919876543210?text="));
  assert.equal(decodeURIComponent(link.split("text=")[1]), msg);
});
