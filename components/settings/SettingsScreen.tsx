"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CategoryManager } from "@/components/settings/CategoryManager";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, inputClass } from "@/components/ui/Field";
import { Money } from "@/components/ui/Money";
import { PageHeader } from "@/components/ui/PageHeader";
import { ScreenSkeleton } from "@/components/ui/Skeleton";
import {
  downloadTextFile,
  exportFilename,
  parseStoreJSON,
  serializeStoreJSON,
  toCSV,
} from "@/lib/export";
import {
  checkStorageAvailability,
  persistentStorageGranted,
  requestPersistentStorage,
} from "@/lib/storage";
import {
  replaceStore,
  resetStore,
  updateSettings,
  useStore,
} from "@/lib/store";
import type { Store } from "@/lib/types";

export function SettingsScreen() {
  const store = useStore();

  if (!store) return <ScreenSkeleton title="Settings" />;

  return <SettingsContent store={store} />;
}

function SettingsContent({ store }: { store: Store }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currency, setCurrency] = useState(store.settings.currency);
  const [locale, setLocale] = useState(store.settings.locale);
  const [weekStartsOn, setWeekStartsOn] = useState<0 | 1>(
    store.settings.weekStartsOn,
  );
  const [settingsError, setSettingsError] = useState("");
  const [settingsStatus, setSettingsStatus] = useState("");
  const [pendingImport, setPendingImport] = useState<{
    store: Store;
    fileName: string;
  } | null>(null);
  const [importError, setImportError] = useState("");
  const [importStatus, setImportStatus] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [storageOk] = useState(() => checkStorageAvailability());
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const [persistMessage, setPersistMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    persistentStorageGranted().then((granted) => {
      if (!cancelled) setPersisted(granted);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const previewCurrency = currency.trim().toUpperCase() || "PHP";
  const previewLocale = locale.trim() || "en-PH";
  const currencyError =
    settingsError && /currency/i.test(settingsError) ? settingsError : "";
  const localeError =
    settingsError && /locale/i.test(settingsError) ? settingsError : "";

  function handleSettingsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextCurrency = currency.trim().toUpperCase();
    const nextLocale = locale.trim();

    if (!/^[A-Z]{3}$/.test(nextCurrency)) {
      setSettingsError(
        "Use a three-letter currency code, such as PHP or USD.",
      );
      setSettingsStatus("");
      return;
    }

    try {
      new Intl.NumberFormat(nextLocale);
    } catch {
      setSettingsError("Enter a valid locale, such as en-PH or en-US.");
      setSettingsStatus("");
      return;
    }

    updateSettings({
      currency: nextCurrency,
      locale: nextLocale,
      weekStartsOn,
    });
    setCurrency(nextCurrency);
    setLocale(nextLocale);
    setSettingsError("");
    setSettingsStatus("Preferences saved.");
  }

  function handleExportJSON() {
    downloadTextFile(
      exportFilename("json"),
      serializeStoreJSON(store),
      "application/json",
    );
  }

  function handleExportCSV() {
    downloadTextFile(exportFilename("csv"), toCSV(store), "text/csv");
  }

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImportStatus("");
    setImportError("");
    setPendingImport(null);

    try {
      const text = await file.text();
      const result = parseStoreJSON(text);

      if (!result.ok) {
        setImportError(result.error);
        return;
      }

      setPendingImport({ store: result.store, fileName: file.name });
    } catch {
      setImportError("The file could not be read.");
    }
  }

  function confirmImport() {
    if (!pendingImport) return;
    replaceStore(pendingImport.store);
    setCurrency(pendingImport.store.settings.currency);
    setLocale(pendingImport.store.settings.locale);
    setWeekStartsOn(pendingImport.store.settings.weekStartsOn);
    setImportStatus("Backup imported.");
    setPendingImport(null);
  }

  function handleReset() {
    resetStore();
    setConfirmReset(false);
    router.push("/");
  }

  async function handlePersistRequest() {
    const granted = await requestPersistentStorage();
    setPersisted(granted);
    setPersistMessage(
      granted
        ? "Persistent storage is on."
        : "This browser did not grant persistent storage.",
    );
  }

  return (
    <>
      <PageHeader title="Settings" />

      <div className="max-w-[42rem] space-y-8">
        <section className="first:border-t-0">
          <h2 className="text-lg font-semibold tracking-[-0.01em]">
            Preferences
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            These control how amounts and dates are shown. They do not convert
            values.
          </p>

          <form onSubmit={handleSettingsSubmit} className="mt-5" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Currency"
                htmlFor="settings-currency"
                hint="ISO 4217"
                error={currencyError || undefined}
              >
                <input
                  id="settings-currency"
                  type="text"
                  value={currency}
                  maxLength={3}
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={Boolean(currencyError) || undefined}
                  aria-describedby={
                    currencyError ? "settings-currency-error" : undefined
                  }
                  onChange={(event) => {
                    setCurrency(event.target.value.toUpperCase());
                    setSettingsError("");
                    setSettingsStatus("");
                  }}
                  className={`${inputClass} num uppercase`}
                />
              </Field>

              <Field
                label="Locale"
                htmlFor="settings-locale"
                hint="For number and date formatting"
                error={localeError || undefined}
              >
                <input
                  id="settings-locale"
                  type="text"
                  value={locale}
                  maxLength={35}
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={Boolean(localeError) || undefined}
                  aria-describedby={
                    localeError ? "settings-locale-error" : undefined
                  }
                  onChange={(event) => {
                    setLocale(event.target.value);
                    setSettingsError("");
                    setSettingsStatus("");
                  }}
                  className={inputClass}
                />
              </Field>

              <Field label="Week starts on" htmlFor="settings-week-start">
                <select
                  id="settings-week-start"
                  value={weekStartsOn}
                  onChange={(event) => {
                    setWeekStartsOn(
                      Number(event.target.value) === 0 ? 0 : 1,
                    );
                    setSettingsError("");
                    setSettingsStatus("");
                  }}
                  className={inputClass}
                >
                  <option value={1}>Monday</option>
                  <option value={0}>Sunday</option>
                </select>
              </Field>

              <div className="sm:self-end">
                <p className="text-sm text-muted">
                  Preview{" "}
                  <Money
                    minor={123456}
                    locale={previewLocale}
                    currency={previewCurrency}
                    className="text-ink"
                  />
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button type="submit" variant="primary">
                Save preferences
              </Button>
              <span aria-live="polite" className="text-sm text-positive">
                {settingsStatus}
              </span>
            </div>
          </form>
        </section>

        <section className="border-t border-rule pt-8">
          <h2 className="text-lg font-semibold tracking-[-0.01em]">
            Categories
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Add, rename, or archive the categories used by transactions and
            budgets.
          </p>
          <div className="mt-5">
            <CategoryManager store={store} />
          </div>
        </section>

        <section className="border-t border-rule pt-8">
          <h2 className="text-lg font-semibold tracking-[-0.01em]">Data</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            {store.transactions.length}{" "}
            {store.transactions.length === 1 ? "transaction" : "transactions"}{" "}
            and {store.categories.length}{" "}
            {store.categories.length === 1 ? "category" : "categories"} stored
            in this browser.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={handleExportJSON}>
              Export JSON
            </Button>
            <Button variant="secondary" onClick={handleExportCSV}>
              Export CSV
            </Button>
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              Import JSON
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            aria-label="Import JSON backup"
            onChange={handleImportFile}
            className="sr-only"
            tabIndex={-1}
          />

          {importError && (
            <p role="alert" className="mt-3 text-sm text-negative">
              {importError}
            </p>
          )}
          <p aria-live="polite" className="mt-3 text-sm text-positive">
            {importStatus}
          </p>

          {pendingImport && (
            <div className="mt-4 rounded-[4px] border border-rule bg-paper p-4">
              <p className="text-sm font-medium">
                Replace all data with {pendingImport.fileName}?
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                The backup has {pendingImport.store.transactions.length}{" "}
                {pendingImport.store.transactions.length === 1
                  ? "transaction"
                  : "transactions"}{" "}
                and {pendingImport.store.categories.length}{" "}
                {pendingImport.store.categories.length === 1
                  ? "category"
                  : "categories"}
                . Current data will be lost.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="primary" onClick={confirmImport}>
                  Replace data
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setPendingImport(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="mt-8 border-t border-rule pt-6">
            <h3 className="text-sm font-semibold">Reset</h3>
            <p className="mt-1 text-sm leading-6 text-muted">
              Deletes every transaction, budget, and category from this
              browser.
            </p>
            <Button
              variant="danger"
              className="mt-3"
              onClick={() => setConfirmReset(true)}
            >
              Reset all data
            </Button>
          </div>
        </section>

        <section className="border-t border-rule pt-8">
          <h2 className="text-lg font-semibold tracking-[-0.01em]">Storage</h2>

          {!storageOk && (
            <p className="mt-3 border-l-2 border-negative bg-negative/5 px-4 py-3 text-sm leading-6 text-negative">
              Storage is unavailable. Changes may be lost when this tab
              closes. Private browsing, disabled site data, or a full disk can
              cause this.
            </p>
          )}

          <p className="mt-3 text-sm leading-6 text-muted">
            The app stores its data in this browser only. A phone and a laptop
            will not share data.
          </p>

          <div className="mt-4">
            {persisted === true ? (
              <p className="text-sm text-muted">
                Persistent storage is on for this site.
              </p>
            ) : (
              <>
                <Button variant="secondary" onClick={handlePersistRequest}>
                  Request persistent storage
                </Button>
                <p className="mt-2 text-sm leading-6 text-muted">
                  This asks the browser to keep the data when disk space runs
                  low.
                </p>
              </>
            )}
            <p aria-live="polite" className="mt-2 text-sm text-muted">
              {persistMessage}
            </p>
          </div>

          <h3 className="mt-7 text-sm font-semibold">Known limitations</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
            <li>Data lives on one device and one browser.</li>
            <li>Clearing site data deletes everything.</li>
            <li>
              Safari may clear storage for sites that have not been used for
              about a week unless the app is installed to the home screen.
            </li>
          </ul>
          <p className="mt-3 text-sm leading-6 text-muted">
            Export a JSON backup before clearing browser data or changing
            devices.
          </p>
        </section>
      </div>

      {confirmReset && (
        <ConfirmDialog
          title="Reset all data?"
          body="This deletes every transaction, budget, and category stored in this browser. It cannot be undone."
          confirmLabel="Reset everything"
          destructive
          onConfirm={handleReset}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </>
  );
}
