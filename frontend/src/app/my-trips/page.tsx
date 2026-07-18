"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { useTrips } from "@/hooks/useTrips";
import { useProfile } from "@/hooks/useProfile";

export default function MyTripsPage() {
  const { trips, isLoading, updateTripStatus, isUpdating } = useTrips();
  const { profile: user } = useProfile();

  const activeTrips = trips.filter(
    (t: any) => t.status !== "COMPLETED" && t.status !== "CANCELLED"
  );

  const handleCancel = async (tripId: string) => {
    try {
      await updateTripStatus({
        id: tripId,
        payload: { status: "CANCELLED" },
      });
    } catch (err) {
      console.error("Failed to cancel trip", err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "STARTED":
        return <Badge tone="teal">On the way</Badge>;
      case "CONFIRMED":
        return <Badge tone="teal">Confirmed</Badge>;
      case "PENDING":
        return <Badge tone="warning">Pending Approval</Badge>;
      default:
        return <Badge tone="neutral">{status}</Badge>;
    }
  };

  return (
    <AppShell title="My Trips">
      <div className="mx-auto max-w-xl">
        <p className="mb-4 text-sm text-ink-500 dark:text-ink-400">
          Manage your upcoming shared commutes.
        </p>

        {isLoading ? (
          <Card className="flex flex-col items-center gap-4 p-10 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
            <span className="text-sm text-ink-500">Loading upcoming trips...</span>
          </Card>
        ) : activeTrips.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-ink-100 text-ink-400 dark:bg-ink-800">
              <Icons.history width={26} height={26} />
            </div>
            <p className="font-display text-lg font-bold text-ink-800 dark:text-white">No active trips</p>
            <p className="max-w-xs text-sm text-ink-500 dark:text-ink-400">
              You don&apos;t have any active ride bookings or published offers.
            </p>
            <Link href="/dashboard">
              <Button className="mt-2">Search rides</Button>
            </Link>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {activeTrips.map((t: any) => {
              const isDriver = t.ride?.driverId === user?.id;
              const driverName = isDriver
                ? "You (Driver)"
                : `${t.ride?.driver?.firstName || "Colleague"} ${t.ride?.driver?.lastName || ""}`.trim();
              const formattedDate = new Date(t.ride?.date).toLocaleDateString(undefined, {
                weekday: "short",
                day: "numeric",
                month: "short",
              });

              return (
                <Card key={t.id} className="p-5 shadow-soft border border-ink-100/50">
                  <div className="flex items-start justify-between mb-3.5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Route</p>
                      <p className="text-sm font-bold text-ink-800 dark:text-ink-100">
                        {t.ride?.pickupAddress.split(",")[0]} → {t.ride?.destinationAddress.split(",")[0]}
                      </p>
                      <p className="text-xs text-ink-450 mt-0.5">
                        {formattedDate} at {t.ride?.time}
                      </p>
                    </div>
                    {getStatusBadge(t.status)}
                  </div>

                  <div className="route-divider my-3 text-ink-50 dark:text-ink-800" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 font-display text-xs font-bold text-white uppercase">
                        {driverName.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-ink-800 dark:text-ink-100">{driverName}</p>
                        <p className="font-mono text-[10px] text-ink-400">
                          {t.ride?.vehicle?.model || "Vehicle"} · {t.ride?.vehicle?.registrationNumber || "Plate"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold text-teal-650 dark:text-teal-400">₹{t.ride?.farePerSeat}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link href={`/track-ride?tripId=${t.id}`} className="flex-1">
                      <Button className="w-full flex items-center justify-center gap-1.5" size="sm">
                        <Icons.swap width={14} height={14} className="rotate-90" /> Track &amp; Chat
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      className="flex-1"
                      size="sm"
                      onClick={() => handleCancel(t.id)}
                      disabled={isUpdating}
                    >
                      Cancel Trip
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
