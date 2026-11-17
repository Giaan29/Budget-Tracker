const MONTH_PATTERN = /^(\d{4})-(\d{2})$/;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad(value: number, length = 2): string {
  return String(value).padStart(length, "0");
}

export function toDateISO(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayISO(now: Date = new Date()): string {
  return toDateISO(now);
}

export function currentMonthKey(now: Date = new Date()): string {
  return monthOfDate(toDateISO(now));
}

export function monthOfDate(dateISO: string): string {
  return dateISO.slice(0, 7);
}

export function parseDateISO(value: string): Date | null {
  const match = DATE_PATTERN.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function isValidDate(value: string): boolean {
  return parseDateISO(value) !== null;
}

export function isValidMonth(value: string): boolean {
  const match = MONTH_PATTERN.exec(value);
  if (!match) return false;

  const month = Number(match[2]);
  return month >= 1 && month <= 12;
}

export function shiftMonth(month: string, delta: number): string {
  const match = MONTH_PATTERN.exec(month);
  if (!match) {
    throw new Error(`Invalid month: ${month}`);
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const shifted = new Date(year, monthIndex + delta, 1);

  return `${shifted.getFullYear()}-${pad(shifted.getMonth() + 1)}`;
}

export function startOfWeek(date: Date, weekStartsOn: 0 | 1): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = result.getDay();
  const distance = (day - weekStartsOn + 7) % 7;
  result.setDate(result.getDate() - distance);
  return result;
}

function safeFormat(
  date: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions,
  fallback: string,
): string {
  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    return fallback;
  }
}

export function formatMonth(month: string, locale: string): string {
  const match = MONTH_PATTERN.exec(month);
  if (!match) return month;

  const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
  return safeFormat(
    date,
    locale,
    { month: "long", year: "numeric" },
    `${match[1]}-${match[2]}`,
  );
}

export function formatDayHeading(
  dateISO: string,
  locale: string,
  today: string = todayISO(),
): string {
  const date = parseDateISO(dateISO);
  if (!date) return dateISO;

  if (dateISO === today) return "Today";

  const todayDate = parseDateISO(today);
  if (todayDate) {
    const yesterday = new Date(
      todayDate.getFullYear(),
      todayDate.getMonth(),
      todayDate.getDate() - 1,
    );
    if (dateISO === toDateISO(yesterday)) return "Yesterday";
  }

  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "numeric",
    month: "short",
  };

  if (todayDate && date.getFullYear() !== todayDate.getFullYear()) {
    options.year = "numeric";
  }

  return safeFormat(
    date,
    locale,
    options,
    `${dateISO.slice(8, 10)} ${dateISO.slice(5, 7)}`,
  );
}
