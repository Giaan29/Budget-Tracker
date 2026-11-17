"use client";

import { useState, type FormEvent } from "react";
import { Money } from "@/components/ui/Money";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import {
  currencyDigits,
  currencySymbol,
  minorToPlainDecimal,
  parseMoneyInput,
} from "@/lib/money";
import { clearBudget, setBudget } from "@/lib/store";
import type { Category } from "@/lib/types";

type BudgetRowProps = {
  category: Category;
  spent: number;
  limit: number | null;
  month: string;
  locale: string;
  currency: string;
};

export function BudgetRow({
  category,
  spent,
  limit,
  month,
  locale,
  currency,
}: BudgetRowProps) {
  const remaining = limit === null ? null : limit - spent;
  const over = limit !== null && spent > limit;
  const [status, setStatus] = useState("");

  return (
    <li className="border-b border-rule py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-sm font-medium">{category.name}</h2>
        <p className="text-sm text-muted">
          Spent{" "}
          <Money
            minor={spent}
            locale={locale}
            currency={currency}
            className="text-ink"
          />
          {limit === null ? (
            <span> · no limit</span>
          ) : (
            <span>
              {" "}
              of{" "}
              <Money minor={limit} locale={locale} currency={currency} />
            </span>
          )}
        </p>
      </div>

      {limit !== null && (
        <>
          <ProgressBar
            value={spent}
            max={limit}
            label={`${category.name} spending against its limit`}
            className="mt-3"
          />
          <p className="mt-1.5 text-xs text-muted">
            {over ? (
              <span className="text-negative">
                Over by{" "}
                <Money
                  minor={Math.abs(remaining ?? 0)}
                  locale={locale}
                  currency={currency}
                />
              </span>
            ) : (
              <span>
                {(remaining ?? 0) > 0 ? "Left " : "Nothing left "}
                <Money
                  minor={Math.abs(remaining ?? 0)}
                  locale={locale}
                  currency={currency}
                />
              </span>
            )}
          </p>
        </>
      )}

      <BudgetLimitForm
        key={`${category.id}:${month}:${limit ?? "none"}`}
        categoryId={category.id}
        categoryName={category.name}
        month={month}
        limit={limit}
        locale={locale}
        currency={currency}
        onStatus={setStatus}
      />
      <span aria-live="polite" className="text-sm text-positive">
        {status}
      </span>
    </li>
  );
}

type BudgetLimitFormProps = {
  categoryId: string;
  categoryName: string;
  month: string;
  limit: number | null;
  locale: string;
  currency: string;
  onStatus: (message: string) => void;
};

function BudgetLimitForm({
  categoryId,
  categoryName,
  month,
  limit,
  locale,
  currency,
  onStatus,
}: BudgetLimitFormProps) {
  const digits = currencyDigits(currency, locale);
  const symbol = currencySymbol(currency, locale);
  const inputId = `budget-${categoryId}`;
  const errorId = `${inputId}-error`;
  const [value, setValue] = useState(
    limit === null ? "" : minorToPlainDecimal(limit, digits),
  );
  const [error, setError] = useState("");

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const minor = parseMoneyInput(value, locale, currency);

    if (minor === null) {
      setError("Enter a valid limit.");
      onStatus("");
      return;
    }

    setBudget(categoryId, month, minor);
    setError("");
    onStatus("Saved.");
  }

  function clear() {
    clearBudget(categoryId, month);
    setValue("");
    setError("");
    onStatus("Limit removed.");
  }

  return (
    <form onSubmit={save} className="mt-3 flex flex-wrap items-center gap-2">
      <div className="min-w-[9rem] flex-1 sm:max-w-[14rem]">
        <label htmlFor={inputId} className="sr-only">
          Monthly limit for {categoryName}
        </label>
        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted"
          >
            {symbol}
          </span>
          <input
            id={inputId}
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setError("");
              onStatus("");
            }}
            placeholder="No limit"
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? errorId : undefined}
            className={`${inputClass} num pl-8`}
          />
        </div>
        {error && (
          <p id={errorId} role="alert" className="mt-1 text-sm text-negative">
            {error}
          </p>
        )}
      </div>
      <Button type="submit" variant="secondary">
        Save
      </Button>
      {limit !== null && (
        <Button variant="ghost" onClick={clear}>
          Clear
        </Button>
      )}
    </form>
  );
}
