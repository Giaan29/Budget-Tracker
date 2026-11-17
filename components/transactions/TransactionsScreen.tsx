"use client";

import { useState } from "react";
import Link from "next/link";
import { TransactionList } from "@/components/transaction/TransactionList";
import { TransactionForm } from "@/components/transaction/TransactionForm";
import { buttonClass } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { Money } from "@/components/ui/Money";
import { MonthSwitcher } from "@/components/ui/MonthSwitcher";
import { PageHeader } from "@/components/ui/PageHeader";
import { Sheet } from "@/components/ui/Sheet";
import { ScreenSkeleton } from "@/components/ui/Skeleton";
import { currentMonthKey, formatMonth } from "@/lib/dates";
import {
  filterTransactions,
  monthTotals,
  transactionsInMonth,
} from "@/lib/selectors";
import { useStore } from "@/lib/store";
import type { Store, Transaction } from "@/lib/types";

type KindFilter = "all" | "expense" | "income";

export function TransactionsScreen() {
  const store = useStore();

  if (!store) return <ScreenSkeleton title="Transactions" />;

  return <TransactionsContent store={store} />;
}

function TransactionsContent({ store }: { store: Store }) {
  const [month, setMonth] = useState(() => currentMonthKey());
  const [kind, setKind] = useState<KindFilter>("all");
  const [categoryId, setCategoryId] = useState("all");
  const [editing, setEditing] = useState<Transaction | null>(null);
  const { locale, currency } = store.settings;
  const monthTransactions = transactionsInMonth(store.transactions, month);
  const visible = filterTransactions(monthTransactions, { kind, categoryId });
  const totals = monthTotals(store, month);
  const hasFilters = kind !== "all" || categoryId !== "all";

  const expenseCategories = store.categories.filter(
    (category) => category.kind === "expense",
  );
  const incomeCategories = store.categories.filter(
    (category) => category.kind === "income",
  );

  return (
    <>
      <PageHeader title="Transactions">
        <MonthSwitcher month={month} locale={locale} onChange={setMonth} />
      </PageHeader>

      <dl className="mb-6 grid grid-cols-3 gap-4 border-y border-rule py-3">
        <div>
          <dt className="text-xs text-muted">Income</dt>
          <dd className="mt-0.5 text-sm">
            <Money
              minor={totals.income}
              locale={locale}
              currency={currency}
            />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Spent</dt>
          <dd className="mt-0.5 text-sm">
            <Money minor={totals.spent} locale={locale} currency={currency} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Net</dt>
          <dd className="mt-0.5 text-sm">
            <Money
              minor={totals.remaining}
              locale={locale}
              currency={currency}
              signed
              tone={
                totals.remaining > 0
                  ? "positive"
                  : totals.remaining < 0
                    ? "negative"
                    : "neutral"
              }
            />
          </dd>
        </div>
      </dl>

      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        <Field label="Type" htmlFor="filter-kind">
          <select
            id="filter-kind"
            value={kind}
            onChange={(event) => setKind(event.target.value as KindFilter)}
            className={inputClass}
          >
            <option value="all">All types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>
        </Field>
        <Field label="Category" htmlFor="filter-category">
          <select
            id="filter-category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className={inputClass}
          >
            <option value="all">All categories</option>
            {expenseCategories.length > 0 && (
              <optgroup label="Expense">
                {expenseCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                    {category.archived ? " (archived)" : ""}
                  </option>
                ))}
              </optgroup>
            )}
            {incomeCategories.length > 0 && (
              <optgroup label="Income">
                {incomeCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                    {category.archived ? " (archived)" : ""}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </Field>
      </div>

      {visible.length === 0 ? (
        <div className="border-t border-rule py-10">
          <p className="text-sm leading-6 text-muted">
            {hasFilters
              ? "No transactions match these filters."
              : `No transactions in ${formatMonth(month, locale)}.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/transactions/new"
              className={buttonClass("primary", "md")}
            >
              Add transaction
            </Link>
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setKind("all");
                  setCategoryId("all");
                }}
                className={buttonClass("ghost", "md")}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <TransactionList
          store={store}
          transactions={visible}
          onEdit={setEditing}
        />
      )}

      {editing && (
        <Sheet
          title="Edit transaction"
          onClose={() => setEditing(null)}
        >
          <TransactionForm
            transaction={editing}
            onDone={() => setEditing(null)}
          />
        </Sheet>
      )}
    </>
  );
}
