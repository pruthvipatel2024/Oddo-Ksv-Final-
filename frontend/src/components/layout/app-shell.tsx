"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Icons } from "@/components/ui/icons";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Icons.dashboard },
  { href: "/my-trips", label: "My Trips", icon: Icons.trips },
  { href: "/ride-history", label: "Ride History", icon: Icons.history },
  { href: "/my-vehicle", label: "My Vehicle", icon: Icons.vehicle },
  { href: "/wallet", label: "Wallet", icon: Icons.wallet },
  { href: "/reports", label: "Reports", icon: Icons.reports },
  { href: "/settings", label: "Settings", icon: Icons.settings },
];

export function AppShell({ children, title }: { children: ReactNode; title: string }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-ink-50 dark:bg-ink-950">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-100 bg-white px-4 py-6 dark:border-ink-800 dark:bg-ink-900 md:flex">
        <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500 text-white">
            <Icons.car width={18} height={18} />
          </span>
          <span className="font-display text-lg font-bold text-ink-800 dark:text-white">RidesFare</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300"
                    : "text-ink-500 hover:bg-ink-50 hover:text-ink-800 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100"
                }`}
              >
                <item.icon width={18} height={18} />
                {item.label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-teal-500" />}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/login"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-400 hover:bg-ink-50 hover:text-danger dark:hover:bg-ink-800"
        >
          <Icons.logout width={18} height={18} />
          Log out
        </Link>
      </aside>

      {/* Main column */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-ink-100 bg-white/80 px-6 py-4 backdrop-blur dark:border-ink-800 dark:bg-ink-900/80">
          <div>
            <h1 className="font-display text-xl font-bold text-ink-800 dark:text-white">{title}</h1>
            <div className="route-divider mt-1 w-16 text-teal-400" />
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 font-display text-sm font-bold text-white">
              R
            </div>
          </div>
        </header>
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
