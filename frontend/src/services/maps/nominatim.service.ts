import axios from 'axios';
import { env } from '@/src/config/env';

export interface GeocodingResult {
  label: string;
  lat: number;
  lng: number;
}

export const nominatimService = {
  /**
   * Search address coordinates dynamically via Nominatim open API.
   */
  searchAddress: async (query: string): Promise<GeocodingResult[]> => {
    if (!query || query.trim().length < 3) return [];
    
    try {
      const baseUrl = env.NOMINATIM_URL || 'https://nominatim.openstreetmap.org/search';
      const response = await axios.get(baseUrl, {
        params: {
          q: query,
          format: 'json',
          addressdetails: 1,
          limit: 5,
        },
        headers: {
          'User-Agent': 'EnterpriseCarpoolPlatform/1.0',
        },
      });

      return (response.data || []).map((item: any) => ({
        label: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }));
    } catch (error) {
      console.error('Nominatim search failed:', error);
      return [];
    }
  },
};
