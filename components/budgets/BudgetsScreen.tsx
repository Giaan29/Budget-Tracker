"use client";

import Link from "next/link";
import { useState } from "react";
import { BudgetRow } from "@/components/budget/BudgetRow";
import { buttonClass, Button } from "@/components/ui/Button";
import { Money } from "@/components/ui/Money";
import { MonthSwitcher } from "@/components/ui/MonthSwitcher";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScreenSkeleton } from "@/components/ui/Skeleton";
import { currentMonthKey, formatMonth, shiftMonth } from "@/lib/dates";
import { budgetSummary, spentByCategory } from "@/lib/selectors";
import { copyBudgetsFromMonth, useStore } from "@/lib/store";
import type { Store } from "@/lib/types";

export function BudgetsScreen() {
  const store = useStore();

  if (!store) return <ScreenSkeleton title="Budgets" />;

  return <BudgetsContent store={store} />;
}

function BudgetsContent({ store }: { store: Store }) {
  const [month, setMonth] = useState(() => currentMonthKey());
  const [status, setStatus] = useState("");
  const { locale, currency } = store.settings;
  const expenseCategories = store.categories.filter(
    (category) => category.kind === "expense" && !category.archived,
  );
  const expenseIds = new Set(
    expenseCategories.map((category) => category.id),
  );
  const previousMonth = shiftMonth(month, -1);
  const previousCount = store.budgets.filter(
    (budget) =>
      budget.month === previousMonth && expenseIds.has(budget.categoryId),
  ).length;
  const summary = budgetSummary(store, month);
  const spent = spentByCategory(store.transactions, month);

  function handleCopy() {
    const copied = copyBudgetsFromMonth(month);
    setStatus(
      copied === 0
        ? "No limits were left to copy."
        : `Copied ${copied} ${copied === 1 ? "limit" : "limits"} from ${formatMonth(previousMonth, locale)}.`,
    );
  }

  return (
    <>
      <PageHeader title="Budgets">
        <MonthSwitcher
          month={month}
          locale={locale}
          onChange={(next) => {
            setMonth(next);
            setStatus("");
          }}
        />
      </PageHeader>

      <dl className="grid grid-cols-3 gap-4 border-y border-rule py-3">
        <div>
          <dt className="text-xs text-muted">Budgeted</dt>
          <dd className="mt-0.5 text-sm">
            <Money
              minor={summary.budgeted}
              locale={locale}
              currency={currency}
            />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Spent</dt>
          <dd className="mt-0.5 text-sm">
            <Money minor={summary.spent} locale={locale} currency={currency} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Left</dt>
          <dd className="mt-0.5 text-sm">
            <Money
              minor={summary.remaining}
              locale={locale}
              currency={currency}
              signed
              tone={summary.remaining < 0 ? "negative" : "positive"}
            />
          </dd>
        </div>
      </dl>

      {summary.budgeted > 0 && (
        <ProgressBar
          value={summary.spent}
          max={summary.budgeted}
          label="Total spending against total budget"
          className="mt-4"
        />
      )}

      <div className="mt-10 flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-3">
        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-muted">
            Limits
          </h2>
          <p className="mt-1 text-sm text-muted">
            What each category can spend in {formatMonth(month, locale)}.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={handleCopy}
          disabled={previousCount === 0}
        >
          Copy last month
        </Button>
      </div>
      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-positive">
        {status}
      </p>

      {expenseCategories.length === 0 ? (
        <div className="py-8">
          <p className="text-sm leading-6 text-muted">
            There are no active expense categories. Add one in Settings to set
            limits.
          </p>
          <Link
            href="/settings"
            className={buttonClass("secondary", "md", "mt-4")}
          >
            Open Settings
          </Link>
        </div>
      ) : (
        <ul>
          {expenseCategories.map((category) => {
            const limit =
              store.budgets.find(
                (budget) =>
                  budget.categoryId === category.id && budget.month === month,
              )?.limit ?? null;

            return (
              <BudgetRow
                key={`${category.id}:${month}`}
                category={category}
                spent={spent.get(category.id) ?? 0}
                limit={limit}
                month={month}
                locale={locale}
                currency={currency}
              />
            );
          })}
        </ul>
      )}
    </>
  );
}
