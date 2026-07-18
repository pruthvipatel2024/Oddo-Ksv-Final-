"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingsApi, CreateBookingPayload, UpdateBookingStatusPayload } from '@/src/services/api/bookings.api';

export function useBookings() {
  const queryClient = useQueryClient();

  // Query: Get all bookings
  const bookingsQuery = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const res = await bookingsApi.findAll() as any;
      return res.data || [];
    },
  });

  // Mutation: Request booking seat
  const createBookingMutation = useMutation({
    mutationFn: async (payload: CreateBookingPayload) => {
      const res = await bookingsApi.create(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['employee-dashboard'] });
    },
  });

  // Mutation: Update booking status (confirm / reject / cancel)
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateBookingStatusPayload }) => {
      const res = await bookingsApi.updateStatus(id, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['employee-dashboard'] });
    },
  });

  return {
    bookings: bookingsQuery.data || [],
    isLoading: bookingsQuery.isLoading,
    createBooking: createBookingMutation.mutateAsync,
    isCreating: createBookingMutation.isPending,
    updateBookingStatus: updateBookingStatusMutation.mutateAsync,
    isUpdating: updateBookingStatusMutation.isPending,
  };
}
