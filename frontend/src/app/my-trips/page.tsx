"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { useTrips } from "@/hooks/useTrips";
import { useRides } from "@/hooks/useRides";
import { useBookings } from "@/hooks/useBookings";
import { useProfile } from "@/hooks/useProfile";

export default function MyTripsPage() {
  const [activeTab, setActiveTab] = useState<"booked" | "offers">("booked");
  const { trips, isLoading: isLoadingTrips, updateTripStatus, isUpdating: isUpdatingTrip } = useTrips();
  const { myOffers, isLoadingOffers, cancelRide, isCancelling } = useRides();
  const { updateBookingStatus, isUpdating: isUpdatingBooking } = useBookings();
  const { profile: user } = useProfile();

  const activeTrips = trips.filter(
    (t: any) => t.status !== "COMPLETED" && t.status !== "CANCELLED"
  );

  const handleTripStatusChange = async (tripId: string, status: "STARTED" | "COMPLETED" | "CANCELLED") => {
    try {
      await updateTripStatus({
        id: tripId,
        payload: { status },
      });
    } catch (err) {
      console.error(`Failed to transition trip ${tripId} status to ${status}`, err);
    }
  };

  const handleBookingApproval = async (bookingId: string, status: "CONFIRMED" | "REJECTED") => {
    try {
      await updateBookingStatus({
        id: bookingId,
        payload: { status },
      });
    } catch (err) {
      console.error(`Failed to update booking status for ${bookingId}`, err);
    }
  };

  const handleCancelRide = async (rideId: string) => {
    if (confirm("Are you sure you want to cancel this ride offer? All pending bookings will be automatically refunded.")) {
      try {
        await cancelRide(rideId);
      } catch (err) {
        console.error("Failed to cancel ride offer", err);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "STARTED":
      case "IN_PROGRESS":
        return <Badge tone="teal">On the way</Badge>;
      case "CONFIRMED":
      case "BOOKED":
        return <Badge tone="teal">Confirmed</Badge>;
      case "PENDING":
        return <Badge tone="warning">Pending Approval</Badge>;
      case "CANCELLED":
        return <Badge tone="neutral">Cancelled</Badge>;
      case "COMPLETED":
        return <Badge tone="teal">Completed</Badge>;
      default:
        return <Badge tone="neutral">{status}</Badge>;
    }
  };

  const isLoading = isLoadingTrips || isLoadingOffers;

  return (
    <AppShell title="My Trips">
      <div className="mx-auto max-w-xl">
        <p className="mb-4 text-sm text-ink-500 dark:text-ink-400">
          Manage your upcoming shared commutes and ride offers.
        </p>

        {/* Tab Selection */}
        <div className="mb-6 flex rounded-xl bg-ink-100 p-1 dark:bg-ink-800">
          <button
            onClick={() => setActiveTab("booked")}
            className={`flex-1 rounded-lg py-2 text-center text-sm font-semibold transition-all ${
              activeTab === "booked"
                ? "bg-white text-teal-600 shadow-sm dark:bg-ink-900 dark:text-teal-400"
                : "text-ink-500 hover:text-ink-700 dark:text-ink-400 dark:hover:text-ink-200"
            }`}
          >
            Booked Rides
          </button>
          <button
            onClick={() => setActiveTab("offers")}
            className={`flex-1 rounded-lg py-2 text-center text-sm font-semibold transition-all ${
              activeTab === "offers"
                ? "bg-white text-teal-600 shadow-sm dark:bg-ink-900 dark:text-teal-400"
                : "text-ink-500 hover:text-ink-700 dark:text-ink-400 dark:hover:text-ink-200"
            }`}
          >
            My Offers ({myOffers.length})
          </button>
        </div>

        {isLoading ? (
          <Card className="flex flex-col items-center gap-4 p-10 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
            <span className="text-sm text-ink-500">Loading trips and offers...</span>
          </Card>
        ) : activeTab === "booked" ? (
          /* BOOKED RIDES LIST */
          activeTrips.length === 0 ? (
            <Card className="flex flex-col items-center gap-3 p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-ink-100 text-ink-400 dark:bg-ink-800">
                <Icons.history width={26} height={26} />
              </div>
              <p className="font-display text-lg font-bold text-ink-800 dark:text-white">No active trips</p>
              <p className="max-w-xs text-sm text-ink-500 dark:text-ink-400">
                You don&apos;t have any active ride bookings or accepted driver commutes right now.
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
                        <p className="font-mono text-sm font-bold text-teal-650 dark:text-teal-400">₹{t.ride?.farePerSeat} / seat</p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link href={`/track-ride?tripId=${t.id}`} className="flex-1">
                        <Button className="w-full flex items-center justify-center gap-1.5" size="sm">
                          <Icons.swap width={14} height={14} className="rotate-90" /> Track &amp; Chat
                        </Button>
                      </Link>

                      {/* Driver Status State Management Controls */}
                      {isDriver ? (
                        <>
                          {t.status === "BOOKED" && (
                            <Button
                              className="flex-1"
                              size="sm"
                              tone="teal"
                              onClick={() => handleTripStatusChange(t.id, "STARTED")}
                              disabled={isUpdatingTrip}
                            >
                              Start Trip
                            </Button>
                          )}
                          {(t.status === "STARTED" || t.status === "IN_PROGRESS") && (
                            <Button
                              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white border-none"
                              size="sm"
                              onClick={() => handleTripStatusChange(t.id, "COMPLETED")}
                              disabled={isUpdatingTrip}
                            >
                              End Trip
                            </Button>
                          )}
                        </>
                      ) : null}

                      {/* Cancel Action */}
                      <Button
                        variant="secondary"
                        className="flex-1"
                        size="sm"
                        onClick={() => handleTripStatusChange(t.id, "CANCELLED")}
                        disabled={isUpdatingTrip}
                      >
                        Cancel Trip
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )
        ) : (
          /* MY OFFERS LIST */
          myOffers.length === 0 ? (
            <Card className="flex flex-col items-center gap-3 p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-ink-100 text-ink-400 dark:bg-ink-800">
                <Icons.swap width={26} height={26} className="rotate-90" />
              </div>
              <p className="font-display text-lg font-bold text-ink-800 dark:text-white">No ride offers</p>
              <p className="max-w-xs text-sm text-ink-500 dark:text-ink-400">
                You haven&apos;t published any ride offers yet.
              </p>
              <Link href="/dashboard">
                <Button className="mt-2">Offer a Ride</Button>
              </Link>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {myOffers.map((offer: any) => {
                const formattedDate = new Date(offer.date).toLocaleDateString(undefined, {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                });

                // Get pending requests
                const pendingBookings = offer.bookings?.filter((b: any) => b.status === "PENDING") || [];
                const otherBookings = offer.bookings?.filter((b: any) => b.status !== "PENDING") || [];

                return (
                  <Card key={offer.id} className="p-5 shadow-soft border border-ink-100/50">
                    <div className="flex items-start justify-between mb-3.5">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Offered Ride</p>
                        <p className="text-sm font-bold text-ink-800 dark:text-ink-100">
                          {offer.pickupAddress.split(",")[0]} → {offer.destinationAddress.split(",")[0]}
                        </p>
                        <p className="text-xs text-ink-450 mt-0.5">
                          {formattedDate} at {offer.time}
                        </p>
                      </div>
                      {getStatusBadge(offer.status)}
                    </div>

                    <div className="flex justify-between items-center bg-ink-50/50 dark:bg-ink-800/40 p-2.5 rounded-lg text-xs font-semibold mt-1">
                      <span className="text-ink-500">Vehicle: {offer.vehicle?.model} ({offer.vehicle?.registrationNumber})</span>
                      <span className="text-teal-650 dark:text-teal-400">{offer.availableSeats} / {offer.availableSeats + (offer.bookings?.reduce((acc: number, b: any) => b.status === 'CONFIRMED' ? acc + b.seatsBooked : acc, 0) || 0)} Seats Available</span>
                    </div>

                    {/* Booking Requests Section */}
                    <div className="mt-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-2">Booking Requests</h4>
                      
                      {offer.bookings?.length === 0 ? (
                        <p className="text-xs italic text-ink-400">No booking requests received yet.</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {/* 1. Pending Bookings requiring approval */}
                          {pendingBookings.map((booking: any) => (
                            <div key={booking.id} className="flex flex-col p-3 rounded-lg border border-warning-200 bg-warning-50/10 dark:border-warning-900/30">
                              <div className="flex justify-between items-center mb-2">
                                <div>
                                  <p className="text-xs font-bold text-ink-800 dark:text-ink-100">
                                    {booking.passenger?.firstName} {booking.passenger?.lastName}
                                  </p>
                                  <p className="text-[10px] text-ink-400">Phone: {booking.passenger?.phone || "N/A"}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-semibold text-warning-650">{booking.seatsBooked} seats requested</p>
                                  <p className="text-[10px] text-ink-400">Escrow: ₹{booking.fare}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  className="flex-1"
                                  size="xs"
                                  tone="teal"
                                  onClick={() => handleBookingApproval(booking.id, "CONFIRMED")}
                                  disabled={isUpdatingBooking}
                                >
                                  Accept Request
                                </Button>
                                <Button
                                  variant="secondary"
                                  className="flex-1"
                                  size="xs"
                                  onClick={() => handleBookingApproval(booking.id, "REJECTED")}
                                  disabled={isUpdatingBooking}
                                >
                                  Reject Request
                                </Button>
                              </div>
                            </div>
                          ))}

                          {/* 2. Confirmed or Closed Bookings */}
                          {otherBookings.map((booking: any) => (
                            <div key={booking.id} className="flex justify-between items-center p-2.5 rounded-lg bg-ink-50/30 dark:bg-ink-800/20 text-xs">
                              <div>
                                <p className="font-bold text-ink-800 dark:text-ink-100">
                                  {booking.passenger?.firstName} {booking.passenger?.lastName}
                                </p>
                                <p className="text-[10px] text-ink-400">{booking.seatsBooked} seats · ₹{booking.fare}</p>
                              </div>
                              <div className="text-right">
                                {getStatusBadge(booking.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Ride Cancellation Controls */}
                    {offer.status === "OPEN" && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="secondary"
                          className="w-full hover:border-red-500 hover:text-red-500 dark:hover:text-red-400"
                          size="sm"
                          onClick={() => handleCancelRide(offer.id)}
                          disabled={isCancelling}
                        >
                          Cancel Offer
                        </Button>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )
        )}
      </div>
    </AppShell>
  );
}
