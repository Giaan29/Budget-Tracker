"use client";

import { Archive, Pencil, RotateCcw } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import {
  addCategory,
  renameCategory,
  setCategoryArchived,
} from "@/lib/store";
import type { CategoryKind, Store } from "@/lib/types";

const groups: Array<{ kind: CategoryKind; label: string }> = [
  { kind: "expense", label: "Expense categories" },
  { kind: "income", label: "Income categories" },
];

export function CategoryManager({ store }: { store: Store }) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<CategoryKind>("expense");
  const [addError, setAddError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState("");

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setAddError("Enter a category name.");
      return;
    }

    if (trimmed.length > 80) {
      setAddError("Keep the name under 80 characters.");
      return;
    }

    const duplicate = store.categories.some(
      (category) =>
        category.kind === kind &&
        category.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (duplicate) {
      setAddError("A category with this name already exists.");
      return;
    }

    addCategory(trimmed, kind);
    setName("");
    setAddError("");
  }

  function startRename(categoryId: string, currentName: string) {
    setEditingId(categoryId);
    setEditName(currentName);
    setEditError("");
  }

  function handleRename(event: FormEvent<HTMLFormElement>, categoryId: string) {
    event.preventDefault();
    const trimmed = editName.trim();

    if (!trimmed) {
      setEditError("Enter a category name.");
      return;
    }

    if (trimmed.length > 80) {
      setEditError("Keep the name under 80 characters.");
      return;
    }

    const category = store.categories.find((item) => item.id === categoryId);
    const duplicate = store.categories.some(
      (item) =>
        item.id !== categoryId &&
        item.kind === category?.kind &&
        item.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (duplicate) {
      setEditError("A category with this name already exists.");
      return;
    }

    renameCategory(categoryId, trimmed);
    setEditingId(null);
    setEditError("");
  }

  return (
    <div>
      <form
        onSubmit={handleAdd}
        className="rounded-[4px] border border-rule bg-surface p-4"
      >
        <div className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_9rem_auto]">
          <Field
            label="New category"
            htmlFor="new-category-name"
            error={addError}
          >
            <input
              id="new-category-name"
              type="text"
              value={name}
              maxLength={80}
              onChange={(event) => {
                setName(event.target.value);
                setAddError("");
              }}
              aria-invalid={Boolean(addError) || undefined}
              aria-describedby={
                addError ? "new-category-name-error" : undefined
              }
              placeholder="Pets"
              className={inputClass}
            />
          </Field>
          <Field label="Type" htmlFor="new-category-kind">
            <select
              id="new-category-kind"
              value={kind}
              onChange={(event) =>
                setKind(event.target.value as CategoryKind)
              }
              className={inputClass}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </Field>
          <Button type="submit" variant="secondary">
            Add category
          </Button>
        </div>
      </form>

      <p className="mt-3 text-xs leading-5 text-muted">
        Archived categories stay on past transactions and are hidden from new
        entries.
      </p>

      <div className="mt-6 space-y-7">
        {groups.map((group) => {
          const categories = store.categories.filter(
            (category) => category.kind === group.kind,
          );

          return (
            <section key={group.kind}>
              <h3 className="border-b border-rule pb-2 text-xs font-medium uppercase tracking-[0.08em] text-muted">
                {group.label}
              </h3>
              {categories.length === 0 ? (
                <p className="py-3 text-sm text-muted">None yet.</p>
              ) : (
                <ul>
                  {categories.map((category) => (
                    <li
                      key={category.id}
                      className="flex min-h-12 items-center justify-between gap-3 border-b border-rule/80 py-2"
                    >
                      {editingId === category.id ? (
                        <form
                          onSubmit={(event) =>
                            handleRename(event, category.id)
                          }
                          className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
                        >
                          <label
                            htmlFor={`rename-${category.id}`}
                            className="sr-only"
                          >
                            Rename {category.name}
                          </label>
                          <input
                            id={`rename-${category.id}`}
                            type="text"
                            value={editName}
                            maxLength={80}
                            autoFocus
                            onChange={(event) => {
                              setEditName(event.target.value);
                              setEditError("");
                            }}
                            aria-invalid={Boolean(editError) || undefined}
                            aria-describedby={
                              editError
                                ? `rename-error-${category.id}`
                                : undefined
                            }
                            className={`${inputClass} min-w-0 flex-1`}
                          />
                          <Button type="submit" variant="secondary">
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setEditingId(null);
                              setEditError("");
                            }}
                          >
                            Cancel
                          </Button>
                          {editError && (
                            <p
                              id={`rename-error-${category.id}`}
                              role="alert"
                              className="w-full text-sm text-negative"
                            >
                              {editError}
                            </p>
                          )}
                        </form>
                      ) : (
                        <>
                          <span
                            className={`min-w-0 truncate text-sm ${
                              category.archived ? "text-muted" : ""
                            }`}
                          >
                            {category.name}
                            {category.archived && (
                              <span className="ml-2 text-xs text-muted">
                                Archived
                              </span>
                            )}
                          </span>
                          <span className="flex shrink-0 items-center">
                            <button
                              type="button"
                              aria-label={`Rename ${category.name}`}
                              title="Rename"
                              onClick={() =>
                                startRename(category.id, category.name)
                              }
                              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[4px] text-muted transition-colors duration-150 hover:bg-paper hover:text-ink"
                            >
                              <Pencil
                                size={20}
                                strokeWidth={1.5}
                                aria-hidden="true"
                              />
                            </button>
                            {category.archived ? (
                              <button
                                type="button"
                                aria-label={`Restore ${category.name}`}
                                title="Restore"
                                onClick={() =>
                                  setCategoryArchived(category.id, false)
                                }
                                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[4px] text-muted transition-colors duration-150 hover:bg-paper hover:text-ink"
                              >
                                <RotateCcw
                                  size={20}
                                  strokeWidth={1.5}
                                  aria-hidden="true"
                                />
                              </button>
                            ) : (
                              <button
                                type="button"
                                aria-label={`Archive ${category.name}`}
                                title="Archive"
                                onClick={() =>
                                  setCategoryArchived(category.id, true)
                                }
                                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[4px] text-muted transition-colors duration-150 hover:bg-paper hover:text-ink"
                              >
                                <Archive
                                  size={20}
                                  strokeWidth={1.5}
                                  aria-hidden="true"
                                />
                              </button>
                            )}
                          </span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
