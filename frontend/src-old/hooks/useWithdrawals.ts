"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { withdrawalsApi, CreateWithdrawalPayload } from '@/src/services/api/withdrawals.api';

export function useWithdrawals() {
  const queryClient = useQueryClient();

  // Query: Get my withdrawals
  const withdrawalsQuery = useQuery({
    queryKey: ['withdrawals'],
    queryFn: async () => {
      const res = await withdrawalsApi.findMyWithdrawals();
      return res.data || [];
    },
  });

  // Mutation: Request a withdrawal payout
  const createWithdrawalMutation = useMutation({
    mutationFn: async (payload: CreateWithdrawalPayload) => {
      const res = await withdrawalsApi.create(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['employee-dashboard'] });
    },
  });

  return {
    withdrawals: withdrawalsQuery.data || [],
    isLoading: withdrawalsQuery.isLoading,
    createWithdrawal: createWithdrawalMutation.mutateAsync,
    isCreating: createWithdrawalMutation.isPending,
  };
}

export function useAllWithdrawalsAdmin() {
  const queryClient = useQueryClient();

  // Query: Get all withdrawal requests globally
  const allQuery = useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: async () => {
      const res = await withdrawalsApi.findAll();
      return res.data || [];
    },
  });

  // Mutation: Update status (Approve, Reject, Complete)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, transactionReference }: { id: string; status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'; transactionReference?: string }) => {
      const res = await withdrawalsApi.updateStatus(id, status, transactionReference);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-dashboard'] });
    },
  });

  return {
    allWithdrawals: allQuery.data || [],
    isLoading: allQuery.isLoading,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
  };
}
