"use client";

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const destinationIcon = L.divIcon({
  html: `<div style="background-color: #EC4899; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.4);"></div>`,
  className: 'custom-destination-marker',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

interface MarkerProps {
  position: [number, number];
  label?: string;
}

export default function DestinationMarker({ position, label }: MarkerProps) {
  return (
    <Marker position={position} icon={destinationIcon}>
      {label && <Popup>{label}</Popup>}
    </Marker>
  );
}
