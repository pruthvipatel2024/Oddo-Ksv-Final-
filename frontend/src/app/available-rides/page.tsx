"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { useRides } from "@/hooks/useRides";
import { useBookings } from "@/hooks/useBookings";

function AvailableRidesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchRides, isSearching } = useRides();
  const { createBooking, isCreating } = useBookings();

  const [ridesList, setRidesList] = useState<any[]>([]);
  const [error, setError] = useState("");

  // Search parameters
  const pickupLat = searchParams.get("pickupLat");
  const pickupLng = searchParams.get("pickupLng");
  const destinationLat = searchParams.get("destinationLat");
  const destinationLng = searchParams.get("destinationLng");
  const date = searchParams.get("date");
  const seats = searchParams.get("seats") || "1";
  const startAddress = searchParams.get("startAddress") || "Pickup Point";
  const destAddress = searchParams.get("destAddress") || "Destination";

  const performSearch = async () => {
    if (!pickupLat || !pickupLng || !destinationLat || !destinationLng) {
      setError("Missing search locations. Please go back and try again.");
      return;
    }
    setError("");

    try {
      const results = await searchRides({
        pickupLat: Number(pickupLat),
        pickupLng: Number(pickupLng),
        destinationLat: Number(destinationLat),
        destinationLng: Number(destinationLng),
        date: date || new Date().toISOString(),
        seatsNeeded: Number(seats),
      });
      setRidesList(results);
    } catch (err: any) {
      setError(err?.message || "Search failed. Please try again.");
    }
  };

  useEffect(() => {
    performSearch();
  }, [pickupLat, pickupLng, destinationLat, destinationLng, date, seats]);

  const handleBook = async (rideId: string) => {
    setError("");
    try {
      await createBooking({
        rideId,
        seatsBooked: Number(seats),
      });
      router.push("/my-trips");
    } catch (err: any) {
      setError(err?.message || "Failed to book seat. Please ensure you have sufficient wallet balance.");
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-teal-500">
        <Icons.chevronLeft width={16} height={16} /> Back to search
      </Link>

      <p className="mb-4 text-sm text-ink-500 dark:text-ink-400">
        Rides matching <span className="font-semibold text-ink-700 dark:text-ink-200">{startAddress.split(",")[0]} → {destAddress.split(",")[0]}</span> ({seats} seat{Number(seats) > 1 ? "s" : ""})
      </p>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-650 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30">
          {error}
        </div>
      )}

      {isSearching ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
          <span className="text-sm text-ink-500">Searching matching rides...</span>
        </div>
      ) : ridesList.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-ink-100 text-ink-400 dark:bg-ink-800">
            <Icons.car width={26} height={26} />
          </div>
          <p className="font-display text-lg font-bold text-ink-800 dark:text-white">No rides available</p>
          <p className="max-w-xs text-sm text-ink-500 dark:text-ink-400">
            No active ride offers match your travel route and detour criteria at this time.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {ridesList.map((ride) => {
            const driverName = `${ride.driver?.firstName || "Colleague"} ${ride.driver?.lastName || ""}`.trim();
            return (
              <Card key={ride.id} className="flex items-center justify-between p-4 shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 font-display text-sm font-bold text-white uppercase">
                    {driverName.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{driverName}</p>
                    <p className="text-xs text-ink-450 truncate max-w-[240px]" title={ride.pickupAddress}>{ride.pickupAddress.split(",")[0]} → {ride.destinationAddress.split(",")[0]}</p>
                    <p className="text-[10px] text-ink-400">Vehicle: {ride.vehicle?.model} ({ride.vehicle?.color})</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="font-mono text-sm font-bold text-teal-600 dark:text-teal-400">₹{ride.farePerSeat}</p>
                  <div className="mb-2">
                    <Badge tone={ride.availableSeats >= Number(seats) ? "teal" : "warning"}>
                      {ride.availableSeats} seat{ride.availableSeats > 1 ? "s" : ""} left
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleBook(ride.id)}
                    disabled={isCreating}
                  >
                    {isCreating ? "Booking..." : "Book Now"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Button variant="secondary" className="mt-4 w-full cursor-pointer" onClick={performSearch} disabled={isSearching}>
        Refresh Results
      </Button>
    </div>
  );
}

export default function AvailableRidesPage() {
  return (
    <AppShell title="Available Rides">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
          <span className="text-sm text-ink-500">Loading search details...</span>
        </div>
      }>
        <AvailableRidesContent />
      </Suspense>
    </AppShell>
  );
}
