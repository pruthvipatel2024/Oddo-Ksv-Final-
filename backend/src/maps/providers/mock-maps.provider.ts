import { MapProvider } from '../interfaces/map-provider.interface';
import { MapRouteResult } from '../interfaces/map-route-result.interface';

export class MockMapsProvider implements MapProvider {
  async getRoute(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
  ): Promise<MapRouteResult> {
    // Haversine distance approximation
    const dLat = destLat - originLat;
    const dLng = destLng - originLng;
    const distanceMeters = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 111000); // 1 degree lat is ~111km

    // Assume average speed 45 km/h (12.5 m/s)
    const durationSeconds = Math.round(distanceMeters / 12.5);

    return {
      // Mock Google encoded polyline string
      polyline: '_p~iF~ps|U_ulLnnqC_mqNvxq`@_ulLnnqC',
      distanceMeters,
      durationSeconds,
      pickupAddress: `Mock Pickup Location (${originLat.toFixed(4)}, ${originLng.toFixed(4)})`,
      destinationAddress: `Mock Destination Location (${destLat.toFixed(4)}, ${destLng.toFixed(4)})`,
    };
  }
}
