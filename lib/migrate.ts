import { isValidDate, isValidMonth } from "./dates.ts";
import type {
  Budget,
  Category,
  CategoryKind,
  Settings,
  Store,
  Transaction,
} from "./types.ts";

export const CURRENT_SCHEMA_VERSION = 1;

export const DEFAULT_SETTINGS: Settings = {
  currency: "PHP",
  locale: "en-PH",
  weekStartsOn: 1,
};

const STARTER_CATEGORIES: Array<{ name: string; kind: CategoryKind }> = [
  { name: "Groceries", kind: "expense" },
  { name: "Dining", kind: "expense" },
  { name: "Transport", kind: "expense" },
  { name: "Housing", kind: "expense" },
  { name: "Utilities", kind: "expense" },
  { name: "Health", kind: "expense" },
  { name: "Shopping", kind: "expense" },
  { name: "Other", kind: "expense" },
  { name: "Salary", kind: "income" },
  { name: "Other income", kind: "income" },
];

function newId(): string {
  return crypto.randomUUID();
}

export function createDefaultStore(): Store {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    settings: { ...DEFAULT_SETTINGS },
    categories: STARTER_CATEGORIES.map((category) => ({
      id: newId(),
      name: category.name,
      kind: category.kind,
      archived: false,
    })),
    transactions: [],
    budgets: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown, maxLength = 200): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

function isValidSettings(value: unknown): value is Settings {
  if (!isRecord(value)) return false;
  if (typeof value.currency !== "string" || !/^[A-Z]{3}$/.test(value.currency)) {
    return false;
  }
  if (!isNonEmptyString(value.locale, 35)) return false;
  if (value.weekStartsOn !== 0 && value.weekStartsOn !== 1) return false;

  try {
    new Intl.NumberFormat(value.locale);
  } catch {
    return false;
  }

  return true;
}

function isValidCategory(value: unknown): value is Category {
  if (!isRecord(value)) return false;
  return (
    isNonEmptyString(value.id, 100) &&
    isNonEmptyString(value.name, 80) &&
    (value.kind === "expense" || value.kind === "income") &&
    typeof value.archived === "boolean"
  );
}

function isValidTransaction(value: unknown): value is Transaction {
  if (!isRecord(value)) return false;
  return (
    isNonEmptyString(value.id, 100) &&
    typeof value.date === "string" &&
    isValidDate(value.date) &&
    typeof value.amount === "number" &&
    Number.isSafeInteger(value.amount) &&
    value.amount > 0 &&
    (value.kind === "expense" || value.kind === "income") &&
    isNonEmptyString(value.categoryId, 100) &&
    typeof value.note === "string"
  );
}

function isValidBudget(value: unknown): value is Budget {
  if (!isRecord(value)) return false;
  return (
    isNonEmptyString(value.categoryId, 100) &&
    typeof value.month === "string" &&
    isValidMonth(value.month) &&
    typeof value.limit === "number" &&
    Number.isSafeInteger(value.limit) &&
    value.limit >= 0
  );
}

export function isValidStore(value: unknown): value is Store {
  if (!isRecord(value)) return false;
  if (value.schemaVersion !== CURRENT_SCHEMA_VERSION) return false;
  if (!isValidSettings(value.settings)) return false;
  if (!Array.isArray(value.categories)) return false;
  if (!Array.isArray(value.transactions)) return false;
  if (!Array.isArray(value.budgets)) return false;
  if (!value.categories.every(isValidCategory)) return false;
  if (!value.transactions.every(isValidTransaction)) return false;
  if (!value.budgets.every(isValidBudget)) return false;

  const categoryById = new Map<string, Category>();
  for (const category of value.categories as Category[]) {
    if (categoryById.has(category.id)) return false;
    categoryById.set(category.id, category);
  }

  const transactionIds = new Set<string>();
  for (const transaction of value.transactions as Transaction[]) {
    if (transactionIds.has(transaction.id)) return false;
    transactionIds.add(transaction.id);

    const category = categoryById.get(transaction.categoryId);
    if (!category || category.kind !== transaction.kind) return false;
  }

  const budgetKeys = new Set<string>();
  for (const budget of value.budgets as Budget[]) {
    const key = `${budget.categoryId}:${budget.month}`;
    if (budgetKeys.has(key)) return false;
    budgetKeys.add(key);

    const category = categoryById.get(budget.categoryId);
    if (!category || category.kind !== "expense") return false;
  }

  return true;
}

/**
 * Converts stored JSON into the current schema. There is only one version so
 * far; the function exists so future versions have one place to upgrade.
 */
export function migrate(input: unknown): Store | null {
  if (!isRecord(input)) return null;
  if (typeof input.schemaVersion !== "number") return null;
  if (input.schemaVersion > CURRENT_SCHEMA_VERSION) return null;
  if (!isValidStore(input)) return null;

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    settings: {
      currency: input.settings.currency,
      locale: input.settings.locale,
      weekStartsOn: input.settings.weekStartsOn,
    },
    categories: input.categories.map((category) => ({
      id: category.id,
      name: category.name,
      kind: category.kind,
      archived: category.archived,
    })),
    transactions: input.transactions.map((transaction) => ({
      id: transaction.id,
      date: transaction.date,
      amount: transaction.amount,
      kind: transaction.kind,
      categoryId: transaction.categoryId,
      note: transaction.note,
    })),
    budgets: input.budgets.map((budget) => ({
      categoryId: budget.categoryId,
      month: budget.month,
      limit: budget.limit,
    })),
  };
}
