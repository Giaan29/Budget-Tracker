"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonth, shiftMonth } from "@/lib/dates";

type MonthSwitcherProps = {
  month: string;
  locale: string;
  onChange: (month: string) => void;
};

export function MonthSwitcher({ month, locale, onChange }: MonthSwitcherProps) {
  return (
    <div className="flex items-center rounded-[4px] border border-rule bg-surface">
      <button
        type="button"
        aria-label="Previous month"
        onClick={() => onChange(shiftMonth(month, -1))}
        className="inline-flex min-h-11 min-w-11 items-center justify-center text-muted transition-colors duration-150 hover:bg-paper hover:text-ink"
      >
        <ChevronLeft size={20} strokeWidth={1.5} aria-hidden="true" />
      </button>
      <span
        aria-live="polite"
        className="min-w-[8.5rem] px-1 text-center text-sm font-medium"
      >
        {formatMonth(month, locale)}
      </span>
      <button
        type="button"
        aria-label="Next month"
        onClick={() => onChange(shiftMonth(month, 1))}
        className="inline-flex min-h-11 min-w-11 items-center justify-center text-muted transition-colors duration-150 hover:bg-paper hover:text-ink"
      >
        <ChevronRight size={20} strokeWidth={1.5} aria-hidden="true" />
      </button>
    </div>
  );
}
