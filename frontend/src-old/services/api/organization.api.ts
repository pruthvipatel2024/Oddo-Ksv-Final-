import { apiClient } from './client';

export interface Organization {
  id: string;
  name: string;
  code: string;
  emailDomain?: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

export const organizationsApi = {
  findAll: () => 
    apiClient.get<{ success: boolean; data: Organization[] }>('/organizations'),
    
  findOne: (id: string) =>
    apiClient.get<{ success: boolean; data: Organization }>(`/organizations/${id}`),
};
