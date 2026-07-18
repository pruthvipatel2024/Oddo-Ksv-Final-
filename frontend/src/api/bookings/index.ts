import { apiClient } from '../client';

export interface CreateBookingPayload {
  rideId: string;
  seatsBooked: number;
}

export interface UpdateBookingStatusPayload {
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'NO_SHOW' | 'EXPIRED';
  cancelReason?: string;
}

export const bookingsApi = {
  create: (payload: CreateBookingPayload) => 
    apiClient.post<{ success: boolean; data: any }>('/bookings', payload),

  findAll: () => 
    apiClient.get<{ success: boolean; data: any[] }>('/bookings'),

  findByRide: (rideId: string) => 
    apiClient.get<{ success: boolean; data: any[] }>(`/bookings/ride/${rideId}`),

  findOne: (id: string) => 
    apiClient.get<{ success: boolean; data: any }>(`/bookings/${id}`),

  updateStatus: (id: string, payload: UpdateBookingStatusPayload) => 
    apiClient.patch<{ success: boolean; data: any }>(`/bookings/${id}/status`, payload),
};
