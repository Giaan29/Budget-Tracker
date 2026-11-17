import assert from "node:assert/strict";
import { test } from "node:test";
import {
  currencyDigits,
  formatMoney,
  minorToPlainDecimal,
  parseMoneyInput,
} from "../lib/money.ts";

test("parses decimal amounts in the locale", () => {
  assert.equal(parseMoneyInput("1,234.56", "en-PH", "PHP"), 123456);
  assert.equal(parseMoneyInput("12.5", "en-PH", "PHP"), 1250);
  assert.equal(parseMoneyInput("0.01", "en-PH", "PHP"), 1);
  assert.equal(parseMoneyInput("12,50", "de-DE", "EUR"), 1250);
  assert.equal(parseMoneyInput("1.234,56", "de-DE", "EUR"), 123456);
});

test("treats separators as grouping where appropriate", () => {
  assert.equal(parseMoneyInput("1,234", "en-PH", "PHP"), 123400);
  assert.equal(parseMoneyInput("1,234,567", "en-PH", "PHP"), 123456700);
  assert.equal(parseMoneyInput("1.234.567", "en-PH", "PHP"), 123456700);
  assert.equal(parseMoneyInput("₱2,500", "en-PH", "PHP"), 250000);
});

test("rejects invalid amounts", () => {
  assert.equal(parseMoneyInput("", "en-PH", "PHP"), null);
  assert.equal(parseMoneyInput("abc", "en-PH", "PHP"), null);
  assert.equal(parseMoneyInput("-5", "en-PH", "PHP"), null);
  assert.equal(parseMoneyInput("1e3", "en-PH", "PHP"), null);
  assert.equal(parseMoneyInput("12.345", "en-PH", "PHP"), null);
  assert.equal(parseMoneyInput("1.2.3", "en-PH", "PHP"), null);
});

test("respects currencies without minor units", () => {
  assert.equal(currencyDigits("JPY", "en-PH"), 0);
  assert.equal(parseMoneyInput("1,000", "en-PH", "JPY"), 1000);
  assert.equal(formatMoney(1500, "en-PH", "JPY"), "¥1,500");
});

test("formats money without negative zero or extra precision", () => {
  const formatted = formatMoney(123456, "en-PH", "PHP");
  assert.match(formatted, /1,234\.56/);
  assert.doesNotMatch(formatMoney(0, "en-PH", "PHP"), /-0/);
  assert.equal(minorToPlainDecimal(125050, 2), "1250.50");
  assert.equal(minorToPlainDecimal(125000, 2), "1250.00");
  assert.equal(minorToPlainDecimal(500, 0), "500");
});
