"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AmountInput } from "@/components/transaction/AmountInput";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { isValidDate, todayISO } from "@/lib/dates";
import {
  currencyDigits,
  minorToPlainDecimal,
  parseMoneyInput,
} from "@/lib/money";
import {
  addTransaction,
  deleteTransaction,
  updateTransaction,
  useStore,
} from "@/lib/store";
import type { CategoryKind, Transaction } from "@/lib/types";

type TransactionFormProps = {
  transaction?: Transaction;
  onDone: () => void;
};

type FormErrors = {
  amount?: string;
  category?: string;
  date?: string;
};

export function TransactionForm({
  transaction,
  onDone,
}: TransactionFormProps) {
  const store = useStore();
  const [kind, setKind] = useState<CategoryKind>(
    transaction?.kind ?? "expense",
  );
  const [amount, setAmount] = useState(() => {
    if (!transaction) return "";
    return minorToPlainDecimal(
      transaction.amount,
      currencyDigits(
        store?.settings.currency ?? "PHP",
        store?.settings.locale ?? "en-PH",
      ),
    );
  });
  const [categoryId, setCategoryId] = useState(() => {
    if (transaction) return transaction.categoryId;
    return (
      store?.categories.find(
        (category) => category.kind === "expense" && !category.archived,
      )?.id ?? ""
    );
  });
  const [date, setDate] = useState(transaction?.date ?? todayISO());
  const [note, setNote] = useState(transaction?.note ?? "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!store) return null;

  const { locale, currency } = store.settings;
  const categories = store.categories.filter(
    (category) =>
      category.kind === kind &&
      (!category.archived || category.id === transaction?.categoryId),
  );

  function chooseKind(next: CategoryKind) {
    if (next === kind) return;
    setKind(next);
    setErrors((current) => ({ ...current, category: undefined }));
    setCategoryId(
      store?.categories.find(
        (category) => category.kind === next && !category.archived,
      )?.id ?? "",
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    const minor = parseMoneyInput(amount, locale, currency);

    if (minor === null || minor <= 0) {
      nextErrors.amount = "Enter an amount greater than zero.";
    }

    const selected = store?.categories.find(
      (category) => category.id === categoryId && category.kind === kind,
    );
    if (!selected) {
      nextErrors.category = "Choose a category.";
    }

    if (!isValidDate(date)) {
      nextErrors.date = "Choose a valid date.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const draft = {
      date,
      amount: minor as number,
      kind,
      categoryId,
      note: note.trim(),
    };

    if (transaction) updateTransaction(transaction.id, draft);
    else addTransaction(draft);

    onDone();
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-1 flex-col"
    >
      <fieldset>
        <legend className="text-sm font-medium">Type</legend>
        <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-[4px] border border-rule bg-paper p-1">
          {(["expense", "income"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={kind === option}
              onClick={() => chooseKind(option)}
              className={`min-h-11 rounded-[3px] text-sm font-medium transition-colors duration-150 ${
                kind === option
                  ? "bg-accent text-white"
                  : "text-muted hover:bg-surface hover:text-ink"
              }`}
            >
              {option === "expense" ? "Expense" : "Income"}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6">
        <Field
          label="Amount"
          htmlFor="transaction-amount"
          error={errors.amount}
          hint={currency}
        >
          <AmountInput
            id="transaction-amount"
            value={amount}
            onChange={(value) => {
              setAmount(value);
              setErrors((current) => ({ ...current, amount: undefined }));
            }}
            currency={currency}
            locale={locale}
            invalid={Boolean(errors.amount)}
            describedBy={errors.amount ? "transaction-amount-error" : undefined}
          />
        </Field>
      </div>

      <div className="mt-5 space-y-5">
        <Field
          label="Category"
          htmlFor="transaction-category"
          error={errors.category}
        >
          {categories.length === 0 ? (
            <div className="rounded-[4px] border border-rule bg-paper px-3 py-3 text-sm leading-6 text-muted">
              No active {kind === "expense" ? "expense" : "income"} categories.
              Add one in Settings.{" "}
              <Link
                href="/settings"
                onClick={onDone}
                className="font-medium text-accent underline-offset-4 hover:underline"
              >
                Open Settings
              </Link>
            </div>
          ) : (
            <select
              id="transaction-category"
              value={categoryId}
              onChange={(event) => {
                setCategoryId(event.target.value);
                setErrors((current) => ({ ...current, category: undefined }));
              }}
              aria-invalid={Boolean(errors.category) || undefined}
              aria-describedby={
                errors.category ? "transaction-category-error" : undefined
              }
              className={inputClass}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {category.archived ? " (archived)" : ""}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field label="Date" htmlFor="transaction-date" error={errors.date}>
          <input
            id="transaction-date"
            type="date"
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              setErrors((current) => ({ ...current, date: undefined }));
            }}
            aria-invalid={Boolean(errors.date) || undefined}
            aria-describedby={
              errors.date ? "transaction-date-error" : undefined
            }
            className={inputClass}
          />
        </Field>

        <Field
          label="Note"
          htmlFor="transaction-note"
          hint="Optional"
        >
          <input
            id="transaction-note"
            type="text"
            value={note}
            maxLength={200}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Lunch with a client"
            className={inputClass}
          />
        </Field>
      </div>

      {transaction && (
        <div className="mt-6 border-t border-rule pt-4">
          {confirmDelete ? (
            <div className="space-y-3">
              <p className="text-sm font-medium">Delete this transaction?</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="danger-solid"
                  onClick={() => {
                    deleteTransaction(transaction.id);
                    onDone();
                  }}
                >
                  Delete transaction
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setConfirmDelete(false)}
                >
                  Keep it
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              Delete transaction
            </Button>
          )}
        </div>
      )}

      <div className="sticky bottom-0 mt-auto -mx-5 flex flex-wrap justify-end gap-2 border-t border-rule bg-surface px-5 py-4 pb-safe-lg lg:-mx-6 lg:px-6">
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={categories.length === 0}>
          {transaction ? "Save changes" : "Add transaction"}
        </Button>
      </div>
    </form>
  );
}
