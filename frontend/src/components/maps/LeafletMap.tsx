"use client";

import { MapContainer, TileLayer } from 'react-leaflet';
import { env } from '@/src/config/env';
import PickupMarker from './PickupMarker';
import DestinationMarker from './DestinationMarker';
import DriverMarker from './DriverMarker';
import PassengerMarker from './PassengerMarker';
import RoutePolyline from './RoutePolyline';
import MapControls from './MapControls';

interface LeafletMapProps {
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

export default function LeafletMap({
  pickupCoords,
  pickupLabel,
  destCoords,
  destLabel,
  driverCoords,
  driverName,
  passengerCoords,
  passengerName,
  routeGeometry,
  className = "h-full w-full",
}: LeafletMapProps) {
  // Center is defaulted to India / Central Gujarat coordinates
  const defaultCenter: [number, number] = [23.0225, 72.5714]; 
  const defaultZoom = 12;

  // Build route bounds for zooming
  const boundsPoints: [number, number][] = [];
  if (pickupCoords) boundsPoints.push(pickupCoords);
  if (destCoords) boundsPoints.push(destCoords);
  if (driverCoords) boundsPoints.push(driverCoords);

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={pickupCoords || defaultCenter}
        zoom={defaultZoom}
        zoomControl={false} // Disable default so we can place custom clean control buttons
        style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
      >
        <TileLayer
          url={env.MAP_TILE_URL}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {pickupCoords && (
          <PickupMarker position={pickupCoords} label={pickupLabel || 'Pickup Location'} />
        )}
        
        {destCoords && (
          <DestinationMarker position={destCoords} label={destLabel || 'Destination Location'} />
        )}

        {driverCoords && (
          <DriverMarker position={driverCoords} driverName={driverName} />
        )}

        {passengerCoords && (
          <PassengerMarker position={passengerCoords} passengerName={passengerName} />
        )}

        {routeGeometry && routeGeometry.length > 0 && (
          <RoutePolyline positions={routeGeometry} />
        )}

        <MapControls bounds={boundsPoints.length > 0 ? boundsPoints : undefined} />
      </MapContainer>
    </div>
  );
}
