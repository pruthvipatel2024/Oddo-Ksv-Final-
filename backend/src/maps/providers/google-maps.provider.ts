import { MapProvider } from '../interfaces/map-provider.interface';
import { MapRouteResult } from '../interfaces/map-route-result.interface';

export class GoogleMapsProvider implements MapProvider {
  constructor(private readonly apiKey: string) {}

  async getRoute(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
  ): Promise<MapRouteResult> {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&key=${this.apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
        throw new Error(data.error_message || `Google Maps API returned status: ${data.status}`);
      }

      const route = data.routes[0];
      const leg = route.legs[0];

      return {
        polyline: route.overview_polyline.points,
        distanceMeters: leg.distance.value,
        durationSeconds: leg.duration.value,
        pickupAddress: leg.start_address,
        destinationAddress: leg.end_address,
      };
    } catch (err: any) {
      throw new Error(`Failed to calculate route via Google Maps: ${err.message}`);
    }
  }
}
