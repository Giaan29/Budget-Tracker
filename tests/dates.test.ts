import assert from "node:assert/strict";
import { test } from "node:test";
import {
  currentMonthKey,
  formatDayHeading,
  formatMonth,
  isValidDate,
  isValidMonth,
  monthOfDate,
  shiftMonth,
  startOfWeek,
  todayISO,
} from "../lib/dates.ts";

test("uses local dates for today and month keys", () => {
  const date = new Date(2026, 10, 17, 23, 30);
  assert.equal(todayISO(date), "2026-11-17");
  assert.equal(currentMonthKey(date), "2026-11");
  assert.equal(monthOfDate("2026-03-09"), "2026-03");
});

test("shifts months across year boundaries", () => {
  assert.equal(shiftMonth("2026-01", -1), "2025-12");
  assert.equal(shiftMonth("2026-12", 1), "2027-01");
  assert.equal(shiftMonth("2026-11", 0), "2026-11");
});

test("validates dates and months", () => {
  assert.equal(isValidDate("2026-02-28"), true);
  assert.equal(isValidDate("2024-02-29"), true);
  assert.equal(isValidDate("2026-02-29"), false);
  assert.equal(isValidDate("2026-02-30"), false);
  assert.equal(isValidMonth("2026-12"), true);
  assert.equal(isValidMonth("2026-13"), false);
});

test("formats month and day headings", () => {
  assert.match(formatMonth("2026-11", "en-PH"), /November/);
  assert.match(formatMonth("2026-11", "en-PH"), /2026/);
  assert.equal(formatDayHeading("2026-11-17", "en-PH", "2026-11-17"), "Today");
  assert.equal(formatDayHeading("2026-11-16", "en-PH", "2026-11-17"), "Yesterday");
  assert.match(formatDayHeading("2026-11-10", "en-PH", "2026-11-17"), /10/);
});

test("finds the start of the week", () => {
  const sunday = new Date(2026, 10, 15);
  assert.equal(todayISO(startOfWeek(sunday, 1)), "2026-11-09");
  assert.equal(todayISO(startOfWeek(sunday, 0)), "2026-11-15");
});
