/**
 * Maps wrapper service.
 * Handles address label mapping and polyline formatting.
 */
import { env } from '@/src/config/env';

export const mapsService = {
  getApiKey: (): string => {
    return env.GOOGLE_MAPS_KEY || '';
  },

  getMockRouteData: (pickupAddress: string, destinationAddress: string) => {
    // Simulates static fallback calculations
    return {
      distanceText: '15.4 km',
      durationText: '28 mins',
      pickupAddress,
      destinationAddress,
    };
  }
};
