import { monthOfDate } from "./dates.ts";
import type { Budget, Category, Store, Transaction } from "./types.ts";

export type MonthTotals = {
  income: number;
  spent: number;
  remaining: number;
};

export type CategorySpendRow = {
  category: Category;
  spent: number;
  limit: number | null;
};

export type DayGroup = {
  date: string;
  transactions: Transaction[];
  net: number;
};

export function transactionsInMonth(
  transactions: Transaction[],
  month: string,
): Transaction[] {
  return transactions.filter(
    (transaction) => monthOfDate(transaction.date) === month,
  );
}

export function monthTotals(store: Store, month: string): MonthTotals {
  const transactions = transactionsInMonth(store.transactions, month);
  let income = 0;
  let spent = 0;

  for (const transaction of transactions) {
    if (transaction.kind === "income") income += transaction.amount;
    else spent += transaction.amount;
  }

  return { income, spent, remaining: income - spent };
}

export function spentByCategory(
  transactions: Transaction[],
  month: string,
): Map<string, number> {
  const result = new Map<string, number>();

  for (const transaction of transactions) {
    if (monthOfDate(transaction.date) !== month) continue;
    if (transaction.kind !== "expense") continue;
    result.set(
      transaction.categoryId,
      (result.get(transaction.categoryId) ?? 0) + transaction.amount,
    );
  }

  return result;
}

export function budgetLimit(
  budgets: Budget[],
  categoryId: string,
  month: string,
): number | null {
  const budget = budgets.find(
    (item) => item.categoryId === categoryId && item.month === month,
  );
  return budget ? budget.limit : null;
}

export function expenseCategoryRows(
  store: Store,
  month: string,
): CategorySpendRow[] {
  const spent = spentByCategory(store.transactions, month);
  const rows: CategorySpendRow[] = [];

  for (const category of store.categories) {
    if (category.kind !== "expense" || category.archived) continue;

    const categorySpent = spent.get(category.id) ?? 0;
    const limit = budgetLimit(store.budgets, category.id, month);

    if (categorySpent === 0 && limit === null) continue;

    rows.push({ category, spent: categorySpent, limit });
  }

  return rows;
}

export function budgetSummary(
  store: Store,
  month: string,
): { budgeted: number; spent: number; remaining: number; limitCount: number } {
  const spent = spentByCategory(store.transactions, month);
  let budgeted = 0;
  let spentAgainstBudgets = 0;
  let limitCount = 0;

  for (const budget of store.budgets) {
    if (budget.month !== month) continue;

    const category = store.categories.find(
      (item) => item.id === budget.categoryId,
    );
    if (!category || category.kind !== "expense" || category.archived) continue;

    budgeted += budget.limit;
    spentAgainstBudgets += spent.get(budget.categoryId) ?? 0;
    limitCount += 1;
  }

  return {
    budgeted,
    spent: spentAgainstBudgets,
    remaining: budgeted - spentAgainstBudgets,
    limitCount,
  };
}

export function groupTransactionsByDay(
  transactions: Transaction[],
): DayGroup[] {
  const sorted = [...transactions].sort((a, b) => {
    if (a.date === b.date) return b.id.localeCompare(a.id);
    return b.date.localeCompare(a.date);
  });

  const groups: DayGroup[] = [];
  for (const transaction of sorted) {
    const last = groups.at(-1);
    const signed =
      transaction.kind === "income" ? transaction.amount : -transaction.amount;

    if (last && last.date === transaction.date) {
      last.transactions.push(transaction);
      last.net += signed;
    } else {
      groups.push({
        date: transaction.date,
        transactions: [transaction],
        net: signed,
      });
    }
  }

  return groups;
}

export function filterTransactions(
  transactions: Transaction[],
  filters: { kind?: "expense" | "income" | "all"; categoryId?: string | "all" },
): Transaction[] {
  return transactions.filter((transaction) => {
    if (filters.kind && filters.kind !== "all" && transaction.kind !== filters.kind) {
      return false;
    }
    if (
      filters.categoryId &&
      filters.categoryId !== "all" &&
      transaction.categoryId !== filters.categoryId
    ) {
      return false;
    }
    return true;
  });
}
