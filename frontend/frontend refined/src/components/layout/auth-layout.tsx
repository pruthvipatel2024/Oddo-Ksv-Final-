import Link from "next/link";
import { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Icons } from "@/components/ui/icons";

export function AuthLayout({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-50 px-4 py-10 dark:bg-ink-950">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm animate-fade-up">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500 text-white">
            <Icons.car width={18} height={18} />
          </span>
          <span className="font-display text-lg font-bold text-ink-800 dark:text-white">RidesFare</span>
        </Link>

        <div className="rounded-xl2 border border-ink-100 bg-white p-7 shadow-soft-lg dark:border-ink-800 dark:bg-ink-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-500">{eyebrow}</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink-900 dark:text-white">{title}</h1>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </main>
  );
}
