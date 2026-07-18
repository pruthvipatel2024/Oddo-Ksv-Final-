"use client";

import { useEffect, useState } from 'react';
import { trackingSocketService } from '@/src/services/websocket/tracking';
import { tokenStorage } from '@/src/lib/auth/token-storage';

export function useTracking(tripId: string | null, isDriver: boolean) {
  const [driverCoords, setDriverCoords] = useState<[number, number] | null>(null);

  // 1. Join room and receive location updates
  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token || !tripId) return;

    // Join the tracking room for this trip
    trackingSocketService.joinTrip(token, tripId);

    // Register callback for location pings
    const unsubLocation = trackingSocketService.onLocationUpdate(token, (data) => {
      if (data && typeof data.lat === 'number' && typeof data.lng === 'number') {
        setDriverCoords([data.lat, data.lng]);
      }
    });

    return () => {
      unsubLocation();
    };
  }, [tripId]);

  // 2. Automatically publish driver's coordinates
  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token || !tripId || !isDriver) return;

    let watchId: number;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const payload = {
            tripId,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          // Broadcast to websocket tracking room
          trackingSocketService.pingLocation(token, payload);
          setDriverCoords([payload.lat, payload.lng]);
        },
        (error) => {
          console.error('Error fetching driver geolocation:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [tripId, isDriver]);

  return {
    driverCoords,
  };
}
