"use client";

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const passengerIcon = L.divIcon({
  html: `<div style="background-color: #10b981; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.4);"></div>`,
  className: 'custom-passenger-marker',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

interface MarkerProps {
  position: [number, number];
  passengerName?: string;
}

export default function PassengerMarker({ position, passengerName }: MarkerProps) {
  return (
    <Marker position={position} icon={passengerIcon}>
      <Popup>
        <div className="text-xs font-semibold">
          {passengerName || 'Passenger'}
        </div>
      </Popup>
    </Marker>
  );
}
