"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ridesApi, CreateRidePayload, SearchRideQuery } from '@/src/services/api/ride.api';
import { osrmService } from '@/src/services/maps/osrm.service';

export function useRides() {
  const queryClient = useQueryClient();

  // Mutation: Confirm OSRM driving route between pickup and destination coordinates
  const confirmRouteMutation = useMutation({
    mutationFn: async (payload: { pickupLat: number; pickupLng: number; destinationLat: number; destinationLng: number }) => {
      // Query our dynamic OSRM routing service
      const route = await osrmService.getRoute(
        payload.pickupLat,
        payload.pickupLng,
        payload.destinationLat,
        payload.destinationLng
      );
      return route;
    },
  });

  // Mutation: Publish a new ride offer
  const createRideMutation = useMutation({
    mutationFn: async (payload: CreateRidePayload) => {
      const res = await ridesApi.create(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-dashboard'] });
    },
  });

  // Mutation: Perform detour-proximity search
  const searchRidesMutation = useMutation({
    mutationFn: async (query: SearchRideQuery) => {
      const res = await ridesApi.search(query) as any;
      return res.data || [];
    },
  });

  return {
    confirmRoute: confirmRouteMutation.mutateAsync,
    isConfirmingRoute: confirmRouteMutation.isPending,
    createRide: createRideMutation.mutateAsync,
    isCreating: createRideMutation.isPending,
    searchRides: searchRidesMutation.mutateAsync,
    isSearching: searchRidesMutation.isPending,
    searchedRides: searchRidesMutation.data || [],
  };
}
