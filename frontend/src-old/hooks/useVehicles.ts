"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi, CreateVehiclePayload, Vehicle } from '@/src/services/api/vehicles.api';

export function useVehicles() {
  const queryClient = useQueryClient();

  // Query: Get all user vehicles
  const vehiclesQuery = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const res = await vehiclesApi.findAll() as any;
      return (res.data || []) as Vehicle[];
    },
  });

  // Mutation: Register a new vehicle
  const createVehicleMutation = useMutation({
    mutationFn: async (payload: CreateVehiclePayload) => {
      const res = await vehiclesApi.create(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  // Mutation: Update a vehicle
  const updateVehicleMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<CreateVehiclePayload> }) => {
      const res = await vehiclesApi.update(id, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  // Mutation: Delete a vehicle
  const deleteVehicleMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await vehiclesApi.delete(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  // Mutation: Verify a vehicle (Admin)
  const verifyVehicleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED' }) => {
      const res = await vehiclesApi.verify(id, status);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['org-admin-dashboard'] });
    },
  });

  return {
    vehicles: vehiclesQuery.data || [],
    isLoading: vehiclesQuery.isLoading,
    isError: vehiclesQuery.isError,
    refetch: vehiclesQuery.refetch,
    createVehicle: createVehicleMutation.mutateAsync,
    isCreating: createVehicleMutation.isPending,
    updateVehicle: updateVehicleMutation.mutateAsync,
    deleteVehicle: deleteVehicleMutation.mutateAsync,
    verifyVehicle: verifyVehicleMutation.mutateAsync,
  };
}
