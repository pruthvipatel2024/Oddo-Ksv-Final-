import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Icons } from "@/components/ui/icons";

export default function SplashPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-teal-50 to-white px-6 dark:from-ink-950 dark:to-ink-900">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      {/* Ambient route-line background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
        <div className="route-divider absolute left-0 right-0 top-1/3 h-[3px] text-teal-500" />
        <div className="route-divider absolute left-0 right-0 top-2/3 h-[3px] text-teal-500" />
      </div>

      <div className="relative flex animate-fade-up flex-col items-center text-center">
        <span className="mb-6 flex h-16 w-16 animate-drive-in items-center justify-center rounded-2xl bg-teal-500 text-white shadow-soft-lg">
          <Icons.car width={30} height={30} />
        </span>

        <h1 className="font-display text-3xl font-extrabold text-ink-900 dark:text-white sm:text-4xl">
          Ride Together,
          <br />
          <span className="text-teal-500">Save Together.</span>
        </h1>
        <p className="mt-3 max-w-xs text-sm text-ink-500 dark:text-ink-400">
          The enterprise RidesFare platform connecting your team, one shared ride at a time.
        </p>

        <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-teal-500 px-6 py-3 text-center text-sm font-semibold text-white shadow-soft transition-colors hover:bg-teal-600"
          >
            Continue as Employee
          </Link>
          <Link
            href="/admin/login"
            className="rounded-xl border border-ink-200 bg-white px-6 py-3 text-center text-sm font-semibold text-ink-600 transition-colors hover:border-teal-400 hover:text-teal-600 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200"
          >
            Continue as Admin
          </Link>
        </div>
      </div>
    </main>
  );
}
