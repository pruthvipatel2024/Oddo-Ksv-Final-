"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '@/src/services/api/payment.api';

export function usePayments() {
  const queryClient = useQueryClient();

  const checkoutMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await paymentsApi.checkout(bookingId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['employee-dashboard'] });
    },
  });

  return {
    checkout: checkoutMutation.mutateAsync,
    isProcessing: checkoutMutation.isPending,
  };
}
