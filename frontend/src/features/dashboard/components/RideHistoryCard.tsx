"use client";

import React from 'react';
import { History, MapPin, Calendar, Clock, AlertCircle } from 'lucide-react';

interface RideHistoryCardProps {
  trips: any[];
  isLoading?: boolean;
}

export default function RideHistoryCard({ trips, isLoading }: RideHistoryCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 animate-pulse h-40"></div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-150 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
        <History className="h-5 w-5 text-indigo-650" />
        <span>Trip History</span>
      </h2>

      <div className="mt-5 space-y-4">
        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-zinc-200 rounded-xl dark:border-zinc-800">
            <AlertCircle className="h-8 w-8 text-zinc-350" />
            <p className="text-xs font-semibold text-zinc-500 mt-2">No completed rides recorded yet</p>
          </div>
        ) : (
          trips.map((trip) => (
            <div
              key={trip.id}
              className="flex flex-col justify-between items-start border-b border-zinc-100 pb-4 last:border-b-0 last:pb-0 dark:border-zinc-850 sm:flex-row sm:items-center"
            >
              <div className="space-y-1.5 text-left">
                <div className="flex items-center gap-1.5 text-xs text-zinc-800 dark:text-zinc-200 font-semibold">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{trip.route}</span>
                </div>
                <div className="flex items-center gap-2.5 text-[9px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{trip.time}</span>
                  </span>
                </div>
              </div>

              <div className="mt-2 text-left sm:mt-0 sm:text-right">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{trip.fare}</span>
                <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                  {trip.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
