"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { availableRides } from "@/lib/mock-data";

export default function AvailableRidesPage() {
  return (
    <AppShell title="Available Rides">
      <div className="mx-auto max-w-xl">
        <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-teal-500">
          <Icons.chevronLeft width={16} height={16} /> Back to search
        </Link>

        <p className="mb-4 text-sm text-ink-500 dark:text-ink-400">
          Rides matching <span className="font-semibold text-ink-700 dark:text-ink-200">Iskcon → Infocity</span> on 18 Jul
        </p>

        <div className="flex flex-col gap-3">
          {availableRides.map((ride, i) => (
            <Card key={i} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 font-display text-sm font-bold text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
                  {ride.driver.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{ride.driver}</p>
                  <p className="text-xs text-ink-400">{ride.route}</p>
                  <p className="text-xs text-ink-400">{ride.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-bold text-amber-500">₹{ride.fare}</p>
                <Badge tone="teal">Seat {ride.seats} available</Badge>
                <Link href="/track-ride" className="mt-2 block">
                  <Button size="sm" className="w-full">Book Now</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <Button variant="secondary" className="mt-4 w-full">Refresh</Button>
      </div>
    </AppShell>
  );
}
