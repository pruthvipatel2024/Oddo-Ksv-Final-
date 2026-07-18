"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/ui/icons";
import { useTripDetails } from "@/hooks/useTrips";
import { useProfile } from "@/hooks/useProfile";
import { useTracking } from "@/hooks/useTracking";
import { useChat } from "@/hooks/useChat";
import MapCard from "@/components/ui/map-card";

function TrackRideContent() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId");
  const { profile: user } = useProfile();
  
  const { data: trip, isLoading } = useTripDetails(tripId);
  const isDriver = trip?.ride?.driverId === user?.id;

  // Socket Tracking
  const { driverCoords } = useTracking(tripId, isDriver);

  // Socket Chat
  const { messages, sendMessage } = useChat(tripId || "");
  const [chatText, setChatText] = useState("");

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatText.trim()) {
      sendMessage(chatText.trim());
      setChatText("");
    }
  };

  if (isLoading) {
    return (
      <Card className="flex flex-col items-center gap-4 p-10 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
        <span className="text-sm text-ink-500">Loading trip tracking details...</span>
      </Card>
    );
  }

  if (!trip) {
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-ink-100 text-red-500 dark:bg-ink-800">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <p className="font-display text-lg font-bold text-ink-800 dark:text-white">Trip Not Found</p>
        <p className="max-w-xs text-sm text-ink-500 dark:text-ink-400">
          This trip is either completed, cancelled, or doesn&apos;t exist.
        </p>
        <Link href="/my-trips">
          <Button>Back to My Trips</Button>
        </Link>
      </Card>
    );
  }

  const driverName = isDriver
    ? "You (Driver)"
    : `${trip.ride?.driver?.firstName || "Colleague"} ${trip.ride?.driver?.lastName || ""}`.trim();

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
    <div className="mx-auto max-w-xl">
      <Link href="/my-trips" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-teal-500">
        <Icons.chevronLeft width={16} height={16} /> Back to My Trips
      </Link>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Pickup</p>
            <p className="text-sm font-bold text-ink-850 dark:text-ink-100">{trip.ride?.pickupAddress.split(",")[0]}</p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-ink-400">Destination</p>
            <p className="text-sm font-bold text-ink-850 dark:text-ink-100">{trip.ride?.destinationAddress.split(",")[0]}</p>
          </div>
          {getStatusBadge(trip.status)}
        </div>

        <div className="h-60 w-full overflow-hidden rounded-xl border border-ink-100 bg-teal-50 dark:border-ink-800 dark:bg-ink-800 mb-4 shadow-inner">
          <MapCard
            pickupCoords={[trip.ride?.pickupLat, trip.ride?.pickupLng]}
            pickupLabel={trip.ride?.pickupAddress}
            destCoords={[trip.ride?.destinationLat, trip.ride?.destinationLng]}
            destLabel={trip.ride?.destinationAddress}
            driverCoords={driverCoords || undefined}
            driverName={driverName}
          />
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-ink-100 p-3 dark:border-ink-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 font-display text-sm font-bold text-white uppercase">
            {driverName.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{driverName}</p>
            <p className="font-mono text-xs text-ink-400">
              {trip.ride?.vehicle?.model || "Vehicle"} · {trip.ride?.vehicle?.registrationNumber || "Plate"}
            </p>
          </div>
        </div>

        {/* Live Discussion Chat Room */}
        <div className="mt-5 border-t border-ink-100 pt-4 dark:border-ink-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-3 flex items-center gap-1.5">
            <Icons.mail width={14} height={14} /> Ride Chat Room
          </h3>
          
          <div className="h-44 overflow-y-auto rounded-xl bg-ink-50 dark:bg-ink-800/40 p-3 space-y-2.5 mb-3 scrollbar-thin">
            {messages.length === 0 ? (
              <p className="text-[11px] text-ink-400 italic text-center py-8">
                No messages yet. Send a greeting to coordinate coordinates and pick up!
              </p>
            ) : (
              messages.map((m: any, idx: number) => {
                const isMe = m.senderId === user?.id;
                return (
                  <div key={idx} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <span className="text-[9px] text-ink-400 font-semibold mb-0.5">{m.senderName}</span>
                    <span className={`inline-block rounded-xl px-3 py-1.5 text-xs max-w-[80%] ${
                      isMe ? "bg-teal-500 text-white" : "bg-ink-100 text-ink-800 dark:bg-ink-850 dark:text-ink-200"
                    }`}>
                      {m.content}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          
          <form onSubmit={handleSendChat} className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              className="flex-1"
              required
              autoComplete="off"
            />
            <Button type="submit" size="sm">Send</Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

export default function TrackRidePage() {
  return (
    <AppShell title="Track Ride">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
          <span className="text-sm text-ink-500">Loading map components...</span>
        </div>
      }>
        <TrackRideContent />
      </Suspense>
    </AppShell>
  );
}
