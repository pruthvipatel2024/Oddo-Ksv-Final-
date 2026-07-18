import { MapRouteResult } from './map-route-result.interface';

export interface MapProvider {
  getRoute(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
  ): Promise<MapRouteResult>;
}
