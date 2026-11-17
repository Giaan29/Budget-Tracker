"use client";

import { currencySymbol } from "@/lib/money";

type AmountInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  currency: string;
  locale: string;
  invalid?: boolean;
  describedBy?: string;
};

export function AmountInput({
  id,
  value,
  onChange,
  currency,
  locale,
  invalid = false,
  describedBy,
}: AmountInputProps) {
  const symbol = currencySymbol(currency, locale);

  return (
    <div
      className={`flex min-h-14 items-center gap-2 rounded-[4px] border bg-surface px-3 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent ${
        invalid ? "border-negative" : "border-rule"
      }`}
    >
      <span aria-hidden="true" className="num text-lg text-muted">
        {symbol}
      </span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        enterKeyHint="done"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        placeholder="0.00"
        className="num min-w-0 flex-1 bg-transparent py-3 text-2xl tracking-[-0.02em] placeholder:text-muted focus-visible:outline-none"
      />
    </div>
  );
}
