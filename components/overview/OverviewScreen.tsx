"use client";

import Link from "next/link";
import { useState } from "react";
import { MonthSwitcher } from "@/components/ui/MonthSwitcher";
import { Money } from "@/components/ui/Money";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScreenSkeleton } from "@/components/ui/Skeleton";
import { buttonClass } from "@/components/ui/Button";
import { currentMonthKey } from "@/lib/dates";
import {
  budgetSummary,
  expenseCategoryRows,
  monthTotals,
} from "@/lib/selectors";
import { useStore } from "@/lib/store";
import type { Store } from "@/lib/types";

export function OverviewScreen() {
  const store = useStore();

  if (!store) return <ScreenSkeleton title="Overview" />;

  return <OverviewContent store={store} />;
}

function OverviewContent({ store }: { store: Store }) {
  const [month, setMonth] = useState(() => currentMonthKey());
  const { locale, currency } = store.settings;
  const totals = monthTotals(store, month);
  const rows = expenseCategoryRows(store, month);
  const budgets = budgetSummary(store, month);
  const remainingTone =
    totals.remaining > 0
      ? "positive"
      : totals.remaining < 0
        ? "negative"
        : "neutral";
  const unbudgeted = totals.spent - budgets.spent;

  return (
    <>
      <PageHeader title="Overview">
        <MonthSwitcher month={month} locale={locale} onChange={setMonth} />
      </PageHeader>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(15rem,1fr)] lg:gap-12">
        <div>
          <section aria-labelledby="summary-heading" className="pb-2">
            <h2
              id="summary-heading"
              className="text-xs font-medium uppercase tracking-[0.08em] text-muted"
            >
              Summary
            </h2>
            <p className="mt-4 text-sm text-muted">Remaining</p>
            <Money
              minor={totals.remaining}
              locale={locale}
              currency={currency}
              signed
              tone={remainingTone}
              className="mt-1 block text-[2.5rem] leading-none sm:text-[2.75rem]"
            />
            <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-rule pt-5">
              <div>
                <dt className="text-sm text-muted">Income</dt>
                <dd className="mt-1">
                  <Money
                    minor={totals.income}
                    locale={locale}
                    currency={currency}
                  />
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Spent</dt>
                <dd className="mt-1">
                  <Money
                    minor={totals.spent}
                    locale={locale}
                    currency={currency}
                  />
                </dd>
              </div>
            </dl>
          </section>

          <section className="mt-10" aria-labelledby="categories-heading">
            <h2
              id="categories-heading"
              className="border-b border-rule pb-2 text-xs font-medium uppercase tracking-[0.08em] text-muted"
            >
              Categories
            </h2>
            {rows.length === 0 ? (
              <p className="py-8 text-sm leading-6 text-muted">
                No expenses or limits for this month.
              </p>
            ) : (
              <ul>
                {rows.map(({ category, spent, limit }) => {
                  const over = limit !== null && spent > limit;
                  const left = limit === null ? null : limit - spent;

                  return (
                    <li key={category.id} className="border-b border-rule py-4">
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="min-w-0 truncate text-sm font-medium">
                          {category.name}
                        </span>
                        <span className="shrink-0 text-sm text-muted">
                          <Money
                            minor={spent}
                            locale={locale}
                            currency={currency}
                            className="text-ink"
                          />{" "}
                          {limit === null ? (
                            <span>· no limit</span>
                          ) : (
                            <>
                              of{" "}
                              <Money
                                minor={limit}
                                locale={locale}
                                currency={currency}
                              />
                            </>
                          )}
                        </span>
                      </div>
                      {limit !== null && (
                        <>
                          <ProgressBar
                            value={spent}
                            max={limit}
                            label={`${category.name} spending against its limit`}
                            className="mt-2.5"
                          />
                          <p className="mt-1.5 text-xs text-muted">
                            {over ? (
                              <span className="text-negative">
                                Over by{" "}
                                <Money
                                  minor={Math.abs(left ?? 0)}
                                  locale={locale}
                                  currency={currency}
                                />
                              </span>
                            ) : (
                              <>
                                Left{" "}
                                <Money
                                  minor={Math.abs(left ?? 0)}
                                  locale={locale}
                                  currency={currency}
                                />
                              </>
                            )}
                          </p>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <aside className="lg:border-l lg:border-rule lg:pl-8">
          <section aria-labelledby="budgets-heading">
            <h2
              id="budgets-heading"
              className="border-b border-rule pb-2 text-xs font-medium uppercase tracking-[0.08em] text-muted"
            >
              Budgets
            </h2>

            {budgets.limitCount === 0 ? (
              <div className="py-6">
                <p className="text-sm leading-6 text-muted">
                  No limits set for this month.
                </p>
                <Link
                  href="/budgets"
                  className={buttonClass("secondary", "md", "mt-4")}
                >
                  Set budgets
                </Link>
              </div>
            ) : (
              <div className="pt-5">
                <dl className="space-y-3 text-sm">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-muted">Budgeted</dt>
                    <dd>
                      <Money
                        minor={budgets.budgeted}
                        locale={locale}
                        currency={currency}
                      />
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-muted">Spent</dt>
                    <dd>
                      <Money
                        minor={budgets.spent}
                        locale={locale}
                        currency={currency}
                      />
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 border-t border-rule pt-3">
                    <dt className="font-medium">Left</dt>
                    <dd>
                      <Money
                        minor={budgets.remaining}
                        locale={locale}
                        currency={currency}
                        signed
                        tone={
                          budgets.remaining < 0 ? "negative" : "positive"
                        }
                      />
                    </dd>
                  </div>
                </dl>
                <ProgressBar
                  value={budgets.spent}
                  max={budgets.budgeted}
                  label="Total spending against total budget"
                  className="mt-4"
                />
                {unbudgeted > 0 && (
                  <p className="mt-4 text-xs leading-5 text-muted">
                    <Money
                      minor={unbudgeted}
                      locale={locale}
                      currency={currency}
                    />{" "}
                    of spending is outside a limit.
                  </p>
                )}
                <Link
                  href="/budgets"
                  className={buttonClass("secondary", "md", "mt-5 w-full")}
                >
                  Review budgets
                </Link>
              </div>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
