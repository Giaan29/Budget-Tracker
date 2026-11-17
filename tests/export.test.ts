import assert from "node:assert/strict";
import { test } from "node:test";
import {
  parseStoreJSON,
  serializeStoreJSON,
  toCSV,
} from "../lib/export.ts";
import { createDefaultStore } from "../lib/migrate.ts";
import type { Store } from "../lib/types.ts";

function store(): Store {
  return {
    schemaVersion: 1,
    settings: { currency: "PHP", locale: "en-PH", weekStartsOn: 1 },
    categories: [
      { id: "food", name: "Food", kind: "expense", archived: false },
      { id: "salary", name: "Salary", kind: "income", archived: false },
    ],
    transactions: [
      {
        id: "t1",
        date: "2026-11-17",
        amount: 123456,
        kind: "expense",
        categoryId: "food",
        note: 'Coffee, "large"',
      },
      {
        id: "t2",
        date: "2026-11-16",
        amount: 500000,
        kind: "income",
        categoryId: "salary",
        note: "=SUM(A1)",
      },
    ],
    budgets: [{ categoryId: "food", month: "2026-11", limit: 200000 }],
  };
}

test("round-trips a JSON backup", () => {
  const original = store();
  const result = parseStoreJSON(serializeStoreJSON(original));
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.store, original);
});

test("export, reset, then import restores identical data", () => {
  const original = store();
  const backup = serializeStoreJSON(original);

  // Reset writes the starter document, so it is the state after a reset.
  const afterReset = createDefaultStore();
  assert.notDeepEqual(afterReset, original);

  const restored = parseStoreJSON(backup);
  assert.equal(restored.ok, true);
  if (restored.ok) {
    assert.deepEqual(restored.store, original);
    assert.equal(serializeStoreJSON(restored.store), backup);
  }
});

test("rejects invalid and future JSON backups", () => {
  const invalid = parseStoreJSON("not json");
  assert.equal(invalid.ok, false);
  if (!invalid.ok) assert.match(invalid.error, /valid JSON/);

  const future = parseStoreJSON(
    JSON.stringify({ ...store(), schemaVersion: 99 }),
  );
  assert.equal(future.ok, false);
  if (!future.ok) assert.match(future.error, /newer version/);

  const malformed = parseStoreJSON(JSON.stringify({ schemaVersion: 1 }));
  assert.equal(malformed.ok, false);
  if (!malformed.ok) assert.match(malformed.error, /valid budget data/);
});

test("exports CSV with escaped notes and plain decimal amounts", () => {
  const csv = toCSV(store());
  assert.ok(csv.startsWith("\uFEFF"));
  assert.match(csv, /Date,Kind,Category,Amount,Note/);
  assert.match(csv, /2026-11-17,expense,Food,1234\.56,"Coffee, ""large"""/);
  assert.match(csv, /'=SUM\(A1\)/);
});
