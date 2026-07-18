import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MapProvider } from './interfaces/map-provider.interface';
import { MapRouteResult } from './interfaces/map-route-result.interface';
import { GoogleMapsProvider } from './providers/google-maps.provider';
import { MockMapsProvider } from './providers/mock-maps.provider';

@Injectable()
export class MapsService {
  private readonly provider: MapProvider;
  private readonly logger = new Logger('MapsService');

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');

    if (apiKey && apiKey.trim() !== '') {
      this.logger.log('Google Maps API Key found. Using GoogleMapsProvider.');
      this.provider = new GoogleMapsProvider(apiKey);
    } else {
      this.logger.warn('Google Maps API Key is missing or empty. Falling back to MockMapsProvider.');
      this.provider = new MockMapsProvider();
    }
  }

  /**
   * Calculate route details between two coordinates.
   */
  async getRoute(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
  ): Promise<MapRouteResult> {
    this.logger.log(`Calculating route from (${originLat}, ${originLng}) to (${destLat}, ${destLng})`);
    return this.provider.getRoute(originLat, originLng, destLat, destLng);
  }
}
