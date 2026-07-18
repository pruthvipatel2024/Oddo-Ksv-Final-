import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, Badge } from "@/components/ui/card";
import { RouteMap } from "@/components/ui/route-map";
import { Icons } from "@/components/ui/icons";

export default function TrackRidePage() {
  return (
    <AppShell title="Track Ride">
      <div className="mx-auto max-w-xl">
        <Link href="/available-rides" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-teal-500">
          <Icons.chevronLeft width={16} height={16} /> Back
        </Link>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Start Location</p>
              <p className="text-sm font-medium text-ink-800 dark:text-ink-100">Iskcon Cross Road</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Destination</p>
              <p className="text-sm font-medium text-ink-800 dark:text-ink-100">Infocity</p>
            </div>
            <Badge tone="teal">On the way</Badge>
          </div>

          <RouteMap eta="5 minutes" />

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-ink-100 p-3 dark:border-ink-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 font-display text-sm font-bold text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
              RP
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">Raj Patel</p>
              <p className="font-mono text-xs text-ink-400">Swift Dzire · GJ01AB1234</p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
