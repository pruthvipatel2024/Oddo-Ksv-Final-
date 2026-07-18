"use client";

import { useQuery } from '@tanstack/react-query';
import { organizationsApi } from '@/src/services/api/organization.api';

export function useOrganizations() {
  const organizationsQuery = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const res = await organizationsApi.findAll();
      return res.data || [];
    },
  });

  return {
    organizations: organizationsQuery.data || [],
    isLoading: organizationsQuery.isLoading,
    isError: organizationsQuery.isError,
    refetch: organizationsQuery.refetch,
  };
}
