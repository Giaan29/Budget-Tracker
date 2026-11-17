import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "danger-solid";
type Size = "md" | "icon";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[4px] px-4 text-sm font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-strong",
  secondary:
    "border border-rule bg-surface text-ink hover:border-muted/60 hover:bg-paper",
  ghost: "text-muted hover:bg-ink/5 hover:text-ink",
  danger:
    "border border-negative/30 bg-transparent text-negative hover:bg-negative/5",
  "danger-solid": "bg-negative text-white hover:bg-negative/90",
};

const sizes: Record<Size, string> = {
  md: "",
  icon: "min-w-11 px-0",
};

export function buttonClass(
  variant: Variant = "secondary",
  size: Size = "md",
  className = "",
): string {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass(variant, size, className)}
      {...props}
    />
  );
}
