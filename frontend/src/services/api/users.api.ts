import { apiClient } from './client';

export interface UserProfile {
  id: string;
  organizationId?: string;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'SUPER_ADMIN' | 'ORGANIZATION_ADMIN' | 'EMPLOYEE';
  userType: 'INTERNAL' | 'EXTERNAL';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  avatar?: string;
  lastLogin?: string;
}

export const usersApi = {
  getProfile: () => 
    apiClient.get<{ success: boolean; data: UserProfile }>('/users/profile'),

  updateProfile: (payload: Partial<UserProfile>) => 
    apiClient.patch<{ success: boolean; data: UserProfile }>('/users/profile', payload),

  getEmployeeDashboard: () => 
    apiClient.get<{ success: boolean; data: any }>('/users/dashboard/employee'),

  getOrgAdminDashboard: () => 
    apiClient.get<{ success: boolean; data: any }>('/users/dashboard/org-admin'),

  getSuperAdminDashboard: () => 
    apiClient.get<{ success: boolean; data: any }>('/users/dashboard/super-admin'),

  findOne: (id: string) => 
    apiClient.get<{ success: boolean; data: UserProfile }>(`/users/${id}`),

  changePassword: (payload: any) => 
    apiClient.patch<{ success: boolean; message: string }>('/users/change-password', payload),
};
