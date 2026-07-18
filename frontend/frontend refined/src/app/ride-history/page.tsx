"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { rideHistory } from "@/lib/mock-data";

const PAGE_SIZE = 3;

export default function RideHistoryPage() {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = rideHistory.slice(0, visible);
  const hasMore = visible < rideHistory.length;

  return (
    <AppShell title="Ride History">
      <Card className="overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400 dark:border-ink-800">
                <th className="px-5 py-3 font-semibold">Rider / Driver</th>
                <th className="px-5 py-3 font-semibold">Route</th>
                <th className="px-5 py-3 font-semibold">Vehicle</th>
                <th className="px-5 py-3 font-semibold">Date &amp; Time</th>
                <th className="px-5 py-3 font-semibold">Fare</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r, i) => (
                <tr key={i} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60 dark:border-ink-800 dark:hover:bg-ink-800/40">
                  <td className="px-5 py-3.5 font-medium text-ink-800 dark:text-ink-100">{r.name}</td>
                  <td className="px-5 py-3.5 text-ink-500 dark:text-ink-400">{r.route}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-ink-500 dark:text-ink-400">{r.vehicle}</td>
                  <td className="px-5 py-3.5 text-ink-500 dark:text-ink-400">{r.time}</td>
                  <td className="px-5 py-3.5 font-mono text-ink-700 dark:text-ink-200">₹{r.fare}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={r.status === "completed" ? "success" : "danger"}>
                      {r.status === "completed" ? "Completed" : "Cancelled"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {hasMore && (
          <div className="border-t border-ink-100 p-4 dark:border-ink-800">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setVisible((v) => Math.min(v + PAGE_SIZE, rideHistory.length))}
            >
              Load more ({rideHistory.length - visible} remaining)
            </Button>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
