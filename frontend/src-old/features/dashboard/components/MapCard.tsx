"use client";

import dynamic from 'next/dynamic';
import React from 'react';

const LeafletMap = dynamic(
  () => import('@/src/components/maps/LeafletMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-650 border-t-transparent" />
          <span className="text-xs font-semibold text-zinc-500">Loading interactive map tiles...</span>
        </div>
      </div>
    )
  }
);

interface MapCardProps {
  pickupCoords?: [number, number];
  pickupLabel?: string;
  destCoords?: [number, number];
  destLabel?: string;
  driverCoords?: [number, number];
  driverName?: string;
  passengerCoords?: [number, number];
  passengerName?: string;
  routeGeometry?: [number, number][];
  className?: string;
}

export default function MapCard(props: MapCardProps) {
  return (
    <div className="h-full w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 shadow-inner">
      <LeafletMap {...props} />
    </div>
  );
}
