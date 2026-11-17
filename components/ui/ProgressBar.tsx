type ProgressBarProps = {
  value: number;
  max: number;
  label: string;
  className?: string;
};

export function ProgressBar({ value, max, label, className = "" }: ProgressBarProps) {
  const ratio = max <= 0 ? (value > 0 ? 1 : 0) : Math.min(value / max, 1);
  const over = value > max;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={Math.max(max, value, 1)}
      aria-valuenow={value}
      className={`h-1.5 w-full overflow-hidden rounded-[2px] bg-rule/60 ${className}`}
    >
      <div
        className={`h-full transition-[width] duration-150 ${over ? "bg-negative" : "bg-accent"}`}
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}
