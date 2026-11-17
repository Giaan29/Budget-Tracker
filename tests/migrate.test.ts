import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createDefaultStore,
  isValidStore,
  migrate,
} from "../lib/migrate.ts";
import type { Store } from "../lib/types.ts";

function validStore(): Store {
  return {
    schemaVersion: 1,
    settings: { currency: "PHP", locale: "en-PH", weekStartsOn: 1 },
    categories: [
      { id: "expense", name: "Food", kind: "expense", archived: false },
      { id: "income", name: "Salary", kind: "income", archived: false },
    ],
    transactions: [
      {
        id: "tx-1",
        date: "2026-11-17",
        amount: 1250,
        kind: "expense",
        categoryId: "expense",
        note: "",
      },
    ],
    budgets: [{ categoryId: "expense", month: "2026-11", limit: 100000 }],
  };
}

test("creates a valid starter store", () => {
  const store = createDefaultStore();
  assert.equal(store.schemaVersion, 1);
  assert.equal(store.transactions.length, 0);
  assert.ok(store.categories.some((category) => category.kind === "expense"));
  assert.ok(store.categories.some((category) => category.kind === "income"));
  assert.equal(new Set(store.categories.map((category) => category.id)).size, store.categories.length);
  assert.equal(isValidStore(store), true);
});

test("migrates a valid document without changing its data", () => {
  const store = validStore();
  const migrated = migrate(JSON.parse(JSON.stringify(store)));
  assert.deepEqual(migrated, store);
});

test("rejects malformed and future documents", () => {
  assert.equal(migrate(null), null);
  assert.equal(migrate({ schemaVersion: 1 }), null);
  assert.equal(migrate({ ...validStore(), schemaVersion: 2 }), null);

  const floatAmount = validStore();
  floatAmount.transactions[0].amount = 12.5;
  assert.equal(migrate(floatAmount), null);

  const unknownCategory = validStore();
  unknownCategory.transactions[0].categoryId = "missing";
  assert.equal(migrate(unknownCategory), null);

  const mismatchedKind = validStore();
  mismatchedKind.transactions[0].kind = "income";
  assert.equal(migrate(mismatchedKind), null);

  const incomeBudget = validStore();
  incomeBudget.budgets[0].categoryId = "income";
  assert.equal(migrate(incomeBudget), null);
});

test("rejects duplicate identifiers", () => {
  const store = validStore();
  store.categories.push({ ...store.categories[0] });
  assert.equal(migrate(store), null);
});
