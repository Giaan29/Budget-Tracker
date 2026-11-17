const separatorCache = new Map<string, { decimal: string; group: string }>();
const digitsCache = new Map<string, number>();

function separators(locale: string): { decimal: string; group: string } {
  const cached = separatorCache.get(locale);
  if (cached) return cached;

  let result = { decimal: ".", group: "," };
  try {
    const parts = new Intl.NumberFormat(locale).formatToParts(1234.5);
    const decimal = parts.find((part) => part.type === "decimal")?.value;
    const group = parts.find((part) => part.type === "group")?.value;
    result = {
      decimal: decimal ?? ".",
      group: group ?? ",",
    };
  } catch {
    // Keep the fallback separators.
  }

  separatorCache.set(locale, result);
  return result;
}

export function currencyDigits(currency: string, locale = "en-PH"): number {
  const key = `${locale}:${currency}`;
  const cached = digitsCache.get(key);
  if (cached !== undefined) return cached;

  let digits = 2;
  try {
    digits =
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    digits = 2;
  }

  const safeDigits = Number.isInteger(digits) && digits >= 0 ? digits : 2;
  digitsCache.set(key, safeDigits);
  return safeDigits;
}

export function currencySymbol(currency: string, locale = "en-PH"): string {
  try {
    const parts = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0);

    return parts.find((part) => part.type === "currency")?.value ?? currency;
  } catch {
    return currency;
  }
}

export function formatMoney(
  minor: number,
  locale: string,
  currency: string,
): string {
  const digits = currencyDigits(currency, locale);
  const factor = 10 ** digits;
  const major = minor / factor;
  const safeMajor = Object.is(major, -0) ? 0 : major;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(safeMajor);
  } catch {
    return `${minorToPlainDecimal(minor, digits)} ${currency}`;
  }
}

export function minorToPlainDecimal(minor: number, digits: number): string {
  if (!Number.isSafeInteger(minor)) return "";

  const factor = 10 ** digits;
  const sign = minor < 0 ? "-" : "";
  const absolute = Math.abs(minor);
  const whole = Math.floor(absolute / factor);
  const fraction = absolute % factor;

  if (digits === 0) return `${sign}${whole}`;

  return `${sign}${whole}.${String(fraction).padStart(digits, "0")}`;
}

/**
 * Parses user input into integer minor units. Returns null when the input is
 * empty, negative, malformed, or has more precision than the currency allows.
 */
export function parseMoneyInput(
  input: string,
  locale = "en-PH",
  currency = "PHP",
): number | null {
  const digits = currencyDigits(currency, locale);
  let value = input.trim();

  if (!value) return null;
  if (value.startsWith("+")) value = value.slice(1);
  if (value.includes("-") || /[a-zA-Z]/.test(value)) return null;

  value = value.replace(/[^\d.,]/g, "");
  if (!/\d/.test(value)) return null;

  const { decimal, group } = separators(locale);
  const lastDot = value.lastIndexOf(".");
  const lastComma = value.lastIndexOf(",");

  let decimalSeparator: string | null = null;
  if (lastDot >= 0 && lastComma >= 0) {
    decimalSeparator = lastDot > lastComma ? "." : ",";
  } else if (lastDot >= 0) {
    decimalSeparator = ".";
  } else if (lastComma >= 0) {
    decimalSeparator = ",";
  }

  let normalized: string;

  if (!decimalSeparator) {
    normalized = value;
  } else {
    const separatorIndex = value.lastIndexOf(decimalSeparator);
    const after = value.slice(separatorIndex + 1);
    const count = value.split(decimalSeparator).length - 1;
    const before = value.slice(0, separatorIndex);

    if (count > 1) {
      const groups = value.split(decimalSeparator);
      const validGrouping = groups
        .slice(1)
        .every((groupPart) => groupPart.length === 3);

      if (!validGrouping) return null;
      normalized = groups.join("");
    } else if (after.length === 0) {
      normalized = before.replace(/[.,]/g, "");
    } else if (digits === 0) {
      normalized = value.replace(/[.,]/g, "");
    } else if (after.length <= digits) {
      const isLocaleGroup =
        decimalSeparator === group && decimalSeparator !== decimal;
      const looksGrouped =
        isLocaleGroup && after.length === 3 && before.length <= 3;

      normalized = looksGrouped
        ? value.replace(/[.,]/g, "")
        : `${before.replace(/[.,]/g, "")}.${after}`;
    } else {
      const isLocaleGroup =
        decimalSeparator === group && decimalSeparator !== decimal;

      if (isLocaleGroup && after.length === 3) {
        normalized = value.replace(/[.,]/g, "");
      } else {
        return null;
      }
    }
  }

  const cleaned = normalized.replace(/,/g, ".");
  if (cleaned.split(".").length > 2) return null;

  const [wholePart = "0", fractionPart = ""] = cleaned.split(".");
  if (!/^\d*$/.test(wholePart) || !/^\d*$/.test(fractionPart)) return null;

  const whole = wholePart === "" ? 0 : Number(wholePart);
  if (!Number.isSafeInteger(whole)) return null;

  const paddedFraction = fractionPart
    .padEnd(digits, "0")
    .slice(0, digits);

  const minor = whole * 10 ** digits + Number(paddedFraction || "0");
  return Number.isSafeInteger(minor) ? minor : null;
}
