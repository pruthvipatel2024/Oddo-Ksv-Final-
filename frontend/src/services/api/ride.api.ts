import { apiClient } from './client';

export interface ConfirmRoutePayload {
  pickupLat: number;
  pickupLng: number;
  destinationLat: number;
  destinationLng: number;
}

export interface MapRouteResult {
  polyline: string;
  distanceMeters: number;
  durationSeconds: number;
  pickupAddress: string;
  destinationAddress: string;
}

export interface CreateRidePayload {
  vehicleId: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  pickupPlaceId?: string;
  destinationAddress: string;
  destinationLat: number;
  destinationLng: number;
  destinationPlaceId?: string;
  date: string; // ISO Date string
  time: string; // HH:MM
  availableSeats: number;
  farePerSeat: number;
  recurring?: boolean;
}

export interface SearchRideQuery {
  pickupLat: number;
  pickupLng: number;
  destinationLat: number;
  destinationLng: number;
  date: string;
  seatsNeeded?: number;
  pickupRadius?: number;
  destinationRadius?: number;
  timeWindowMinutes?: number;
  minDriverRating?: number;
  vehicleType?: string;
  maxPrice?: number;
}

export const ridesApi = {
  confirmRoute: (payload: ConfirmRoutePayload) => 
    apiClient.post<{ success: boolean; data: MapRouteResult }>('/rides/confirm-route', payload),

  create: (payload: CreateRidePayload) => 
    apiClient.post<{ success: boolean; data: any }>('/rides', payload),

  search: (query: SearchRideQuery) => 
    apiClient.get<{ success: boolean; data: any[] }>('/rides/search', { params: query }),

  findOne: (id: string) => 
    apiClient.get<{ success: boolean; data: any }>(`/rides/${id}`),

  cancel: (id: string) => 
    apiClient.delete<{ success: boolean; data: any }>(`/rides/${id}`),
};
