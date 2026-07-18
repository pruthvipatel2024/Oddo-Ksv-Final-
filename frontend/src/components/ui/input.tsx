import { InputHTMLAttributes, ReactNode, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, hint, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <label htmlFor={inputId} className="block">
        {label && (
          <span className="mb-1.5 block text-sm font-medium text-ink-600 dark:text-ink-300">{label}</span>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 outline-none transition-colors focus:border-teal-500 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100 ${
              icon ? "pl-10" : ""
            } ${className}`}
            {...props}
          />
        </div>
        {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
      </label>
    );
  }
);
Input.displayName = "Input";
