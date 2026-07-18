"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Icons } from "@/components/ui/icons";
import { StatCard } from "@/components/ui/card";
import { orgStats } from "@/lib/mock-data";

const tabs = [
  { href: "/admin/employees", label: "Employees" },
  { href: "/admin/vehicles", label: "Vehicles" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      <header className="border-b border-ink-100 bg-white dark:border-ink-800 dark:bg-ink-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/admin/employees" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-800 text-amber-400 dark:bg-amber-400 dark:text-ink-900">
              <Icons.car width={18} height={18} />
            </span>
            <div>
              <p className="font-display text-base font-bold leading-none text-ink-800 dark:text-white">Carpool</p>
              <p className="text-[11px] text-ink-400">Admin Dashboard</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-800 font-display text-sm font-bold text-amber-400 dark:bg-amber-400 dark:text-ink-900">
                A
              </div>
              <span className="hidden text-sm font-medium text-ink-600 dark:text-ink-300 sm:inline">Admin</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Org stat strip */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total Employees" value={String(orgStats.totalEmployees)} accent="teal" />
          <StatCard label="Registered Vehicles" value={String(orgStats.registeredVehicles)} accent="teal" />
          <StatCard label="Rides This Month" value={String(orgStats.ridesThisMonth)} accent="amber" />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex w-fit gap-1 rounded-xl border border-ink-100 bg-white p-1 dark:border-ink-800 dark:bg-ink-900">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-teal-500 text-white shadow-soft"
                    : "text-ink-500 hover:bg-ink-50 dark:text-ink-400 dark:hover:bg-ink-800"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {children}
      </div>
    </div>
  );
}
