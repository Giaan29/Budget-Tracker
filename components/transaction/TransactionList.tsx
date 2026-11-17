"use client";

import { Money } from "@/components/ui/Money";
import { formatDayHeading } from "@/lib/dates";
import { groupTransactionsByDay } from "@/lib/selectors";
import type { Store, Transaction } from "@/lib/types";

type TransactionListProps = {
  store: Store;
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
};

export function TransactionList({
  store,
  transactions,
  onEdit,
}: TransactionListProps) {
  const groups = groupTransactionsByDay(transactions);
  const categories = new Map(
    store.categories.map((category) => [category.id, category.name]),
  );
  const { locale, currency } = store.settings;

  if (groups.length === 0) {
    return (
      <p className="border-t border-rule py-8 text-sm text-muted">
        No transactions match this view.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.date}>
          <h2 className="flex items-baseline justify-between gap-4 border-b border-rule pb-2 text-xs font-medium uppercase tracking-[0.08em] text-muted">
            <span>{formatDayHeading(group.date, locale)}</span>
            <Money
              minor={group.net}
              locale={locale}
              currency={currency}
              signed
              tone={
                group.net > 0
                  ? "positive"
                  : group.net < 0
                    ? "negative"
                    : "neutral"
              }
              className="text-xs tracking-normal"
            />
          </h2>
          <ul>
            {group.transactions.map((transaction) => (
              <li key={transaction.id}>
                <button
                  type="button"
                  onClick={() => onEdit(transaction)}
                  className="flex min-h-14 w-full items-center justify-between gap-4 border-b border-rule/80 py-3 text-left transition-colors duration-150 hover:bg-surface"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {categories.get(transaction.categoryId) ??
                        "Uncategorized"}
                    </span>
                    {transaction.note && (
                      <span className="mt-0.5 block truncate text-sm text-muted">
                        {transaction.note}
                      </span>
                    )}
                  </span>
                  <Money
                    minor={
                      transaction.kind === "income"
                        ? transaction.amount
                        : -transaction.amount
                    }
                    locale={locale}
                    currency={currency}
                    signed
                    tone={
                      transaction.kind === "income" ? "positive" : "negative"
                    }
                    className="shrink-0 text-sm"
                  />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
