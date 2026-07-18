import { HTMLAttributes, ReactNode } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl2 border border-ink-100 bg-white shadow-soft dark:border-ink-800 dark:bg-ink-900 ${className}`}
      {...props}
    />
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "success" | "danger" | "warning" | "neutral" | "teal";
}) {
  const tones: Record<string, string> = {
    success: "bg-success/10 text-success",
    danger: "bg-danger/10 text-danger",
    warning: "bg-amber-100 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300",
    neutral: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300",
    teal: "bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  sublabel,
  accent = "teal",
}: {
  label: string;
  value: string;
  sublabel?: string;
  accent?: "teal" | "amber";
}) {
  const accentColor = accent === "teal" ? "text-teal-500" : "text-amber-400";
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      <p className={`mt-2 font-display text-3xl font-bold ${accentColor}`}>{value}</p>
      {sublabel && <p className="mt-1 text-xs text-ink-400">{sublabel}</p>}
      <div className={`route-divider mt-4 ${accentColor}`} />
    </Card>
  );
}
