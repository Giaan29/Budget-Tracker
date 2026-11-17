import assert from "node:assert/strict";
import { test } from "node:test";
import {
  budgetSummary,
  expenseCategoryRows,
  filterTransactions,
  groupTransactionsByDay,
  monthTotals,
  spentByCategory,
} from "../lib/selectors.ts";
import type { Store } from "../lib/types.ts";

function store(): Store {
  return {
    schemaVersion: 1,
    settings: { currency: "PHP", locale: "en-PH", weekStartsOn: 1 },
    categories: [
      { id: "food", name: "Food", kind: "expense", archived: false },
      { id: "travel", name: "Travel", kind: "expense", archived: false },
      { id: "old", name: "Old", kind: "expense", archived: true },
      { id: "salary", name: "Salary", kind: "income", archived: false },
    ],
    transactions: [
      {
        id: "t1",
        date: "2026-11-17",
        amount: 120000,
        kind: "expense",
        categoryId: "food",
        note: "Groceries",
      },
      {
        id: "t2",
        date: "2026-11-17",
        amount: 30000,
        kind: "expense",
        categoryId: "travel",
        note: "",
      },
      {
        id: "t3",
        date: "2026-11-16",
        amount: 500000,
        kind: "income",
        categoryId: "salary",
        note: "",
      },
      {
        id: "t4",
        date: "2026-10-31",
        amount: 99900,
        kind: "expense",
        categoryId: "food",
        note: "",
      },
    ],
    budgets: [
      { categoryId: "food", month: "2026-11", limit: 150000 },
      { categoryId: "travel", month: "2026-11", limit: 50000 },
    ],
  };
}

test("calculates month totals", () => {
  assert.deepEqual(monthTotals(store(), "2026-11"), {
    income: 500000,
    spent: 150000,
    remaining: 350000,
  });
});

test("calculates spending by category for a month", () => {
  const spent = spentByCategory(store().transactions, "2026-11");
  assert.equal(spent.get("food"), 120000);
  assert.equal(spent.get("travel"), 30000);
});

test("builds category rows with limits and hides inactive categories", () => {
  const rows = expenseCategoryRows(store(), "2026-11");
  assert.equal(rows.length, 2);
  assert.equal(rows[0].category.id, "food");
  assert.equal(rows[0].spent, 120000);
  assert.equal(rows[0].limit, 150000);
  assert.equal(rows[1].category.id, "travel");
});

test("summarises budgets", () => {
  assert.deepEqual(budgetSummary(store(), "2026-11"), {
    budgeted: 200000,
    spent: 150000,
    remaining: 50000,
    limitCount: 2,
  });
});

test("groups transactions by day with a net total", () => {
  const groups = groupTransactionsByDay(store().transactions);
  assert.equal(groups[0].date, "2026-11-17");
  assert.equal(groups[0].transactions.length, 2);
  assert.equal(groups[0].net, -150000);
  assert.equal(groups[1].date, "2026-11-16");
  assert.equal(groups[1].net, 500000);
  assert.equal(groups[2].date, "2026-10-31");
});

test("filters transactions by kind and category", () => {
  const all = store().transactions;
  assert.equal(filterTransactions(all, { kind: "income" }).length, 1);
  assert.equal(filterTransactions(all, { kind: "expense" }).length, 3);
  assert.equal(filterTransactions(all, { categoryId: "food" }).length, 2);
  assert.equal(
    filterTransactions(all, { kind: "expense", categoryId: "travel" }).length,
    1,
  );
});
