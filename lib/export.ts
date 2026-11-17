import { todayISO } from "./dates.ts";
import { CURRENT_SCHEMA_VERSION, migrate } from "./migrate.ts";
import { currencyDigits, minorToPlainDecimal } from "./money.ts";
import type { Store } from "./types.ts";

export type ImportResult =
  | { ok: true; store: Store }
  | { ok: false; error: string };

const MAX_IMPORT_BYTES = 5_000_000;

export function serializeStoreJSON(store: Store): string {
  return `${JSON.stringify(store, null, 2)}\n`;
}

export function parseStoreJSON(text: string): ImportResult {
  if (text.length > MAX_IMPORT_BYTES) {
    return { ok: false, error: "The file is too large to be a valid backup." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "The file is not valid JSON." };
  }

  if (
    typeof parsed === "object" &&
    parsed !== null &&
    !Array.isArray(parsed) &&
    "schemaVersion" in parsed &&
    typeof parsed.schemaVersion === "number" &&
    parsed.schemaVersion > CURRENT_SCHEMA_VERSION
  ) {
    return {
      ok: false,
      error: "The backup was made with a newer version of the app.",
    };
  }

  const store = migrate(parsed);
  if (!store) {
    return {
      ok: false,
      error: "The backup does not contain valid budget data.",
    };
  }

  return { ok: true, store };
}

function csvCell(value: string): string {
  let safe = value;
  if (/^[=+\-@\t\r]/.test(safe)) safe = `'${safe}`;
  return /[",\n\r]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
}

export function toCSV(store: Store): string {
  const categories = new Map(
    store.categories.map((category) => [category.id, category.name]),
  );
  const digits = currencyDigits(
    store.settings.currency,
    store.settings.locale,
  );
  const rows = [...store.transactions].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  const lines = ["Date,Kind,Category,Amount,Note"];
  for (const transaction of rows) {
    lines.push(
      [
        transaction.date,
        transaction.kind,
        csvCell(categories.get(transaction.categoryId) ?? ""),
        minorToPlainDecimal(transaction.amount, digits),
        csvCell(transaction.note),
      ].join(","),
    );
  }

  return `\uFEFF${lines.join("\n")}\n`;
}

export function exportFilename(extension: "json" | "csv"): string {
  return `budget-tracker-${todayISO()}.${extension}`;
}

export function downloadTextFile(
  filename: string,
  content: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  // Let the browser start the download before releasing the blob URL.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
