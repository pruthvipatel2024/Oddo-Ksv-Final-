"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, UserProfile } from '@/src/services/api/users.api';

export function useEmployees() {
  const queryClient = useQueryClient();

  // Query: Get all employees in the admin's organization
  const employeesQuery = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await usersApi.findAll() as any;
      return (res.data || []) as UserProfile[];
    },
  });

  // Mutation: Suspend or activate an employee's platform access
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'ACTIVE' | 'SUSPENDED' | 'PENDING' }) => {
      const res = await usersApi.updateStatus(id, status);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  return {
    employees: employeesQuery.data || [],
    isLoading: employeesQuery.isLoading,
    isError: employeesQuery.isError,
    refetch: employeesQuery.refetch,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
  };
}
