"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, UserProfile } from '@/src/services/api/users.api';

export function useProfile() {
  const queryClient = useQueryClient();

  // Query: Get active user profile
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await usersApi.getProfile() as any;
      return res.data as UserProfile;
    },
  });

  // Mutation: Update profile details
  const updateProfileMutation = useMutation({
    mutationFn: async (payload: Partial<UserProfile>) => {
      const res = await usersApi.updateProfile(payload) as any;
      return res.data as UserProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    profile: profileQuery.data || null,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    refetch: profileQuery.refetch,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
  };
}

export function useEmployeeDashboard() {
  return useQuery({
    queryKey: ['employee-dashboard'],
    queryFn: async () => {
      const res = await usersApi.getEmployeeDashboard() as any;
      return res.data;
    },
  });
}

export function useOrgAdminDashboard() {
  return useQuery({
    queryKey: ['org-admin-dashboard'],
    queryFn: async () => {
      const res = await usersApi.getOrgAdminDashboard() as any;
      return res.data;
    },
  });
}

export function useSuperAdminDashboard() {
  return useQuery({
    queryKey: ['super-admin-dashboard'],
    queryFn: async () => {
      const res = await usersApi.getSuperAdminDashboard() as any;
      return res.data;
    },
  });
}
