"use client";

import { useEffect } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

const driverIcon = L.divIcon({
  html: `<div style="background-color: #0ea5e9; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(14,165,233,0.6); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">🚗</div>`,
  className: 'custom-driver-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface MarkerProps {
  position: [number, number];
  driverName?: string;
}

export default function DriverMarker({ position, driverName }: MarkerProps) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.panTo(position);
    }
  }, [position, map]);

  return (
    <Marker position={position} icon={driverIcon}>
      <Popup>
        <div className="text-xs font-semibold">
          {driverName || 'Driver'} (Active Location)
        </div>
      </Popup>
    </Marker>
  );
}
