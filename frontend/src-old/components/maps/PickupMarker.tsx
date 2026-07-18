"use client";

import { useEffect } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for dynamic custom leaflet divIcon
const pickupIcon = L.divIcon({
  html: `<div style="background-color: #4F46E5; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.4);"></div>`,
  className: 'custom-pickup-marker',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

interface MarkerProps {
  position: [number, number];
  label?: string;
}

export default function PickupMarker({ position, label }: MarkerProps) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.panTo(position);
    }
  }, [position, map]);

  return (
    <Marker position={position} icon={pickupIcon}>
      {label && <Popup>{label}</Popup>}
    </Marker>
  );
}
