import { apiClient } from './client';

export interface TripParticipant {
  id: string;
  tripId: string;
  userId: string;
  role: 'DRIVER' | 'PASSENGER';
  createdAt: string;
}

export interface TripDetails {
  id: string;
  rideId: string;
  status: 'BOOKED' | 'STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startedAt?: string;
  completedAt?: string;
  actualStartLocation?: string;
  actualEndLocation?: string;
  actualDistance?: number;
  averageSpeed?: number;
  endedBy?: string;
  createdAt: string;
  updatedAt: string;
  ride: any;
  participants: TripParticipant[];
  history: any[];
  conversation?: any;
}

export interface UpdateTripStatusPayload {
  status: 'BOOKED' | 'STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  actualStartLocation?: string;
  actualEndLocation?: string;
}

export const tripsApi = {
  findMyTrips: () => 
    apiClient.get<{ success: boolean; data: TripDetails[] }>('/trips'),

  findOne: (id: string) => 
    apiClient.get<{ success: boolean; data: TripDetails }>(`/trips/${id}`),

  updateStatus: (id: string, payload: UpdateTripStatusPayload) => 
    apiClient.patch<{ success: boolean; data: TripDetails }>(`/trips/${id}/status`, payload),
};
