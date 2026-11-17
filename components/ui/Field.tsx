import type { ReactNode } from "react";

export const inputClass =
  "min-h-11 w-full rounded-[4px] border border-rule bg-surface px-3 text-base text-ink placeholder:text-muted hover:border-muted/50 focus:border-accent";

type FieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  errorId?: string;
  children: ReactNode;
  className?: string;
};

export function Field({
  label,
  htmlFor,
  hint,
  error,
  errorId = `${htmlFor}-error`,
  children,
  className = "",
}: FieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
          {label}
        </label>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </div>
      {children}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-negative">
          {error}
        </p>
      )}
    </div>
  );
}
