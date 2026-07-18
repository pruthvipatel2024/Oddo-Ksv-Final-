import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-teal-500 text-white hover:bg-teal-600 active:bg-teal-700 shadow-soft disabled:bg-ink-200 disabled:text-ink-400 dark:disabled:bg-ink-700 dark:disabled:text-ink-500",
  secondary:
    "bg-white text-ink-700 border border-ink-200 hover:border-teal-400 hover:text-teal-600 dark:bg-ink-800 dark:text-ink-100 dark:border-ink-600 dark:hover:border-teal-400",
  ghost: "bg-transparent text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800",
  danger: "bg-danger text-white hover:bg-danger/90",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 rounded-lg",
  md: "text-sm px-4 py-2.5 rounded-xl",
  lg: "text-base px-6 py-3 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-70 ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
