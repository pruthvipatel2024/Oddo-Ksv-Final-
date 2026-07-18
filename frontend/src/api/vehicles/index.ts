import { apiClient } from '../client';

export interface Vehicle {
  id: string;
  ownerId: string;
  manufacturer: string;
  model: string;
  color: string;
  registrationNumber: string;
  seatingCapacity: number;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED';
  vehiclePhoto?: string;
  isActive: boolean;
}

export interface CreateVehiclePayload {
  manufacturer: string;
  model: string;
  color: string;
  registrationNumber: string;
  seatingCapacity: number;
  vehiclePhoto?: string;
}

export const vehiclesApi = {
  create: (payload: CreateVehiclePayload) => 
    apiClient.post<{ success: boolean; data: Vehicle }>('/vehicles', payload),

  findAll: () => 
    apiClient.get<{ success: boolean; data: Vehicle[] }>('/vehicles'),

  findOne: (id: string) => 
    apiClient.get<{ success: boolean; data: Vehicle }>(`/vehicles/${id}`),

  update: (id: string, payload: Partial<CreateVehiclePayload>) => 
    apiClient.patch<{ success: boolean; data: Vehicle }>(`/vehicles/${id}`, payload),

  delete: (id: string) => 
    apiClient.delete<{ success: boolean; data: any }>(`/vehicles/${id}`),

  verify: (id: string, status: 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED') => 
    apiClient.patch<{ success: boolean; data: Vehicle }>(`/vehicles/${id}/verify`, { status }),
};
