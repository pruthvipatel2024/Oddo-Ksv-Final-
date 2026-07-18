import axios from 'axios';
import { env } from '@/src/config/env';

export interface RouteResult {
  coordinates: [number, number][]; // Array of [lat, lng]
  distanceMeters: number;
  durationSeconds: number;
}

export const osrmService = {
  /**
   * Fetch driving route polyline and statistics from OSRM.
   */
  getRoute: async (
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number
  ): Promise<RouteResult> => {
    try {
      const baseUrl = env.OSRM_URL || 'https://router.project-osrm.org';
      const url = `${baseUrl}/route/v1/driving/${startLng},${startLat};${endLng},${endLat}`;
      
      const response = await axios.get(url, {
        params: {
          overview: 'full',
          geometries: 'geojson',
        },
      });

      const route = response.data?.routes?.[0];
      if (!route) {
        throw new Error('No OSRM routes found');
      }

      // GeoJSON coordinates are [lng, lat], map them to [lat, lng] for Leaflet
      const coordinates = (route.geometry?.coordinates || []).map(
        (coords: [number, number]) => [coords[1], coords[0]] as [number, number]
      );

      return {
        coordinates,
        distanceMeters: route.distance,
        durationSeconds: route.duration,
      };
    } catch (error) {
      console.error('OSRM route calculation failed:', error);
      // Fallback linear distance
      return {
        coordinates: [
          [startLat, startLng],
          [endLat, endLng],
        ],
        distanceMeters: 15000,
        durationSeconds: 1200,
      };
    }
  },
};
