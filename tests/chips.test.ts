import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeUnique, moveItem, normalizeSize, splitTokens } from "../lib/chips.ts";

test("splits on spaces, commas, slashes and newlines", () => {
  assert.deepEqual(splitTokens("38 40 42 44"), ["38", "40", "42", "44"]);
  assert.deepEqual(splitTokens("S, M,L ,XL"), ["S", "M", "L", "XL"]);
  assert.deepEqual(splitTokens("S/M/L\nXL;XXL"), ["S", "M", "L", "XL", "XXL"]);
  assert.deepEqual(splitTokens("   "), []);
});

test("keeps multi-word sizes intact", () => {
  assert.deepEqual(splitTokens("free size"), ["Free Size"]);
  assert.deepEqual(splitTokens("S M Free-Size"), ["S", "M", "Free Size"]);
});

test("normalises letter sizes only", () => {
  assert.equal(normalizeSize("xl"), "XL");
  assert.equal(normalizeSize("xxs"), "XXS");
  assert.equal(normalizeSize("3xl"), "3XL");
  assert.equal(normalizeSize("38"), "38");
  assert.equal(normalizeSize("Free Size"), "Free Size");
});

test("merges case-insensitively without duplicates and respects max", () => {
  assert.deepEqual(mergeUnique(["S", "M"], ["m", "L", "L", " "]), ["S", "M", "L"]);
  assert.deepEqual(mergeUnique(["S"], ["M", "L"], 2), ["S", "M"]);
});

test("moves items", () => {
  assert.deepEqual(moveItem(["a", "b", "c"], 2, 0), ["c", "a", "b"]);
  assert.deepEqual(moveItem(["a", "b"], 0, 5), ["a", "b"]);
});
