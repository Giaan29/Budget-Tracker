"use client";

import { formatMoney } from "@/lib/money";

type Tone = "neutral" | "positive" | "negative";

type MoneyProps = {
  minor: number;
  locale: string;
  currency: string;
  signed?: boolean;
  tone?: Tone;
  className?: string;
};

export function Money({
  minor,
  locale,
  currency,
  signed = false,
  tone = "neutral",
  className = "",
}: MoneyProps) {
  const prefix = signed && minor > 0 ? "+" : minor < 0 ? "−" : "";
  const toneClass =
    tone === "positive"
      ? "text-positive"
      : tone === "negative"
        ? "text-negative"
        : "";

  return (
    <span className={`num tabular-nums ${toneClass} ${className}`}>
      {prefix}
      {formatMoney(Math.abs(minor), locale, currency)}
    </span>
  );
}
