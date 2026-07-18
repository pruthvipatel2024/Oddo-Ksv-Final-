"use client";

import React from 'react';
import { Calendar, Clock, MapPin, Navigation, Car, AlertCircle } from 'lucide-react';

interface UpcomingTripsCardProps {
  trips: any[];
  onSelectTrip: (trip: any) => void;
  onCancelBooking: (bookingId: string) => void;
  isLoading?: boolean;
}

export default function UpcomingTripsCard({
  trips,
  onSelectTrip,
  onCancelBooking,
  isLoading
}: UpcomingTripsCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 animate-pulse space-y-4">
        <div className="h-4 bg-zinc-200 rounded w-1/3"></div>
        <div className="h-20 bg-zinc-150 rounded"></div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-150 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
        <Navigation className="h-5 w-5 text-indigo-650" />
        <span>Upcoming Trips</span>
      </h2>

      <div className="mt-5 space-y-4">
        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-zinc-200 rounded-xl dark:border-zinc-800">
            <AlertCircle className="h-8 w-8 text-zinc-350" />
            <p className="text-xs font-semibold text-zinc-500 mt-2">No upcoming commutes registered</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">Use search to find rides or publish a new vehicle offer</p>
          </div>
        ) : (
          trips.map((trip) => {
            const isConfirmed = trip.status === 'CONFIRMED';
            return (
              <div
                key={trip.id}
                onClick={() => onSelectTrip(trip)}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50 p-4 transition-all hover:border-indigo-200 hover:shadow-sm dark:border-zinc-850 dark:bg-zinc-900/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                        isConfirmed 
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' 
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30'
                      }`}>
                        {trip.status}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-450 uppercase">{trip.time}</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                        <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                        <span className="font-semibold">{trip.route}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-550">
                        <Car className="h-3.5 w-3.5 text-zinc-400" />
                        <span>{trip.vehicle} · {trip.plate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-zinc-900 dark:text-zinc-100">{trip.fare}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancelBooking(trip.id);
                      }}
                      className="mt-3 text-[10px] font-bold text-red-500 hover:text-red-750 transition-colors uppercase tracking-wider"
                    >
                      Cancel Booking
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
