export type CategoryKind = "expense" | "income";

export type Settings = {
  currency: string;
  locale: string;
  weekStartsOn: 0 | 1;
};

export type Category = {
  id: string;
  name: string;
  kind: CategoryKind;
  archived: boolean;
};

export type Transaction = {
  id: string;
  date: string;
  amount: number;
  kind: CategoryKind;
  categoryId: string;
  note: string;
};

export type Budget = {
  categoryId: string;
  month: string;
  limit: number;
};

export type Store = {
  schemaVersion: 1;
  settings: Settings;
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
};

export type TransactionDraft = Omit<Transaction, "id">;
