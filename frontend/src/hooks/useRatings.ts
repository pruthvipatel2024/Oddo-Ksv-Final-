"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ratingsApi, CreateRatingPayload } from '@/src/services/api/ratings.api';

export function useRatings() {
  const queryClient = useQueryClient();

  // Mutation: Submit a trip rating (driver-to-passenger or passenger-to-driver)
  const submitRatingMutation = useMutation({
    mutationFn: async (payload: CreateRatingPayload) => {
      const res = await ratingsApi.create(payload);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-ratings', variables.revieweeId] });
      queryClient.invalidateQueries({ queryKey: ['my-ratings'] });
      queryClient.invalidateQueries({ queryKey: ['employee-dashboard'] });
    },
  });

  return {
    submitRating: submitRatingMutation.mutateAsync,
    isSubmitting: submitRatingMutation.isPending,
  };
}

export function useUserRatings(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-ratings', userId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await ratingsApi.findUserRatings(userId);
      return res.data;
    },
    enabled: !!userId,
  });
}
