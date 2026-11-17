"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { shiftMonth } from "./dates.ts";
import { createDefaultStore } from "./migrate.ts";
import {
  ensureInitialized,
  getServerSnapshot,
  getSnapshot,
  subscribe,
  updateStore,
  writeStore,
} from "./storage.ts";
import type {
  Category,
  CategoryKind,
  Settings,
  Store,
  Transaction,
  TransactionDraft,
} from "./types.ts";

const StoreContext = createContext<Store | null>(null);

function newId(): string {
  return crypto.randomUUID();
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const store = useSyncExternalStore<Store | null>(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    ensureInitialized();
  }, []);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

/** Returns null on the server and during the first paint. */
export function useStore(): Store | null {
  return useContext(StoreContext);
}

export function addTransaction(draft: TransactionDraft): Transaction {
  const transaction: Transaction = { ...draft, id: newId() };
  updateStore((store) => ({
    ...store,
    transactions: [transaction, ...store.transactions],
  }));
  return transaction;
}

export function updateTransaction(
  id: string,
  draft: TransactionDraft,
): void {
  updateStore((store) => ({
    ...store,
    transactions: store.transactions.map((transaction) =>
      transaction.id === id ? { ...draft, id } : transaction,
    ),
  }));
}

export function deleteTransaction(id: string): void {
  updateStore((store) => ({
    ...store,
    transactions: store.transactions.filter(
      (transaction) => transaction.id !== id,
    ),
  }));
}

export function addCategory(name: string, kind: CategoryKind): Category {
  const category: Category = {
    id: newId(),
    name: name.trim(),
    kind,
    archived: false,
  };
  updateStore((store) => ({
    ...store,
    categories: [...store.categories, category],
  }));
  return category;
}

export function renameCategory(id: string, name: string): void {
  updateStore((store) => ({
    ...store,
    categories: store.categories.map((category) =>
      category.id === id ? { ...category, name: name.trim() } : category,
    ),
  }));
}

export function setCategoryArchived(id: string, archived: boolean): void {
  updateStore((store) => ({
    ...store,
    categories: store.categories.map((category) =>
      category.id === id ? { ...category, archived } : category,
    ),
  }));
}

export function setBudget(
  categoryId: string,
  month: string,
  limit: number,
): void {
  updateStore((store) => {
    const existing = store.budgets.some(
      (budget) => budget.categoryId === categoryId && budget.month === month,
    );

    return {
      ...store,
      budgets: existing
        ? store.budgets.map((budget) =>
            budget.categoryId === categoryId && budget.month === month
              ? { ...budget, limit }
              : budget,
          )
        : [...store.budgets, { categoryId, month, limit }],
    };
  });
}

export function clearBudget(categoryId: string, month: string): void {
  updateStore((store) => ({
    ...store,
    budgets: store.budgets.filter(
      (budget) => !(budget.categoryId === categoryId && budget.month === month),
    ),
  }));
}

export function copyBudgetsFromMonth(month: string): number {
  const previousMonth = shiftMonth(month, -1);
  const current = getSnapshot();
  const existing = new Set(
    current.budgets
      .filter((budget) => budget.month === month)
      .map((budget) => budget.categoryId),
  );
  const activeExpenseIds = new Set(
    current.categories
      .filter((category) => category.kind === "expense" && !category.archived)
      .map((category) => category.id),
  );

  const additions = current.budgets
    .filter(
      (budget) =>
        budget.month === previousMonth &&
        !existing.has(budget.categoryId) &&
        activeExpenseIds.has(budget.categoryId),
    )
    .map((budget) => ({
      categoryId: budget.categoryId,
      month,
      limit: budget.limit,
    }));

  if (additions.length > 0) {
    writeStore({
      ...current,
      budgets: [...current.budgets, ...additions],
    });
  }

  return additions.length;
}

export function updateSettings(patch: Partial<Settings>): void {
  updateStore((store) => ({
    ...store,
    settings: { ...store.settings, ...patch },
  }));
}

export function replaceStore(store: Store): void {
  writeStore(store);
}

export function resetStore(): void {
  writeStore(createDefaultStore());
}
