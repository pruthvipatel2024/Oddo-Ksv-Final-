"use client";

import { useMap } from 'react-leaflet';
import { Maximize, ZoomIn, ZoomOut } from 'lucide-react';

interface MapControlsProps {
  bounds?: [number, number][];
}

export default function MapControls({ bounds }: MapControlsProps) {
  const map = useMap();

  const handleResetView = () => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds as any, { padding: [50, 50] });
    }
  };

  return (
    <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={() => map.zoomIn()}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white shadow-md text-zinc-650 hover:bg-zinc-50 active:scale-95 transition-all"
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white shadow-md text-zinc-650 hover:bg-zinc-50 active:scale-95 transition-all"
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      {bounds && bounds.length > 0 && (
        <button
          onClick={handleResetView}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white shadow-md text-zinc-650 hover:bg-zinc-50 active:scale-95 transition-all"
          title="Fit Route Bounds"
        >
          <Maximize className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
