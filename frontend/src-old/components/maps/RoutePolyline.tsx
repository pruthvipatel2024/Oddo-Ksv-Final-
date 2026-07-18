"use client";

import { useEffect } from 'react';
import { Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

interface RoutePolylineProps {
  positions: [number, number][];
}

export default function RoutePolyline({ positions }: RoutePolylineProps) {
  const map = useMap();

  useEffect(() => {
    if (positions && positions.length > 0) {
      try {
        const bounds = L.latLngBounds(positions);
        map.fitBounds(bounds, { padding: [50, 50] });
      } catch (err) {
        // Fallback bounds
      }
    }
  }, [positions, map]);

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: '#4F46E5',
        weight: 6,
        opacity: 0.8,
        dashArray: '10, 5',
        lineCap: 'round',
        lineJoin: 'round',
      }}
    />
  );
}
