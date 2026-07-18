import { apiClient } from './client';

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone: string;
  organizationCode: string;
  userType: 'INTERNAL' | 'EXTERNAL';
  employeeCode?: string;
}

export const authApi = {
  login: (payload: LoginPayload) => 
    apiClient.post<{ success: boolean; data: { accessToken: string; refreshToken: string; user: any } }>('/auth/login', payload),

  register: (payload: RegisterPayload) => 
    apiClient.post<{ success: boolean; data: any }>('/auth/register', payload),

  logout: () => 
    apiClient.post<{ success: boolean }>('/auth/logout'),
};
