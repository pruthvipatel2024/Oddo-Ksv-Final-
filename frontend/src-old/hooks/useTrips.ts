"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tripsApi, UpdateTripStatusPayload } from '@/src/services/api/trips.api';

export function useTrips() {
  const queryClient = useQueryClient();

  // Query: Get all user-involved trips
  const tripsQuery = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const res = await tripsApi.findMyTrips() as any;
      return res.data || [];
    },
  });

  // Mutation: Transition trip status (Start, Complete, Cancel)
  const updateTripStatusMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateTripStatusPayload }) => {
      const res = await tripsApi.updateStatus(id, payload) as any;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['employee-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['org-admin-dashboard'] });
    },
  });

  return {
    trips: tripsQuery.data || [],
    isLoading: tripsQuery.isLoading,
    updateTripStatus: updateTripStatusMutation.mutateAsync,
    isUpdating: updateTripStatusMutation.isPending,
  };
}
export function useTripDetails(tripId: string | null) {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      if (!tripId) return null;
      const res = await tripsApi.findOne(tripId) as any;
      return res.data;
    },
    enabled: !!tripId,
  });
}
