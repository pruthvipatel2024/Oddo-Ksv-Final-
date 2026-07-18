"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi, WalletDetails } from '@/src/services/api/wallet.api';

export function useWallet() {
  const queryClient = useQueryClient();

  // Query: Get wallet details (balances, transactions)
  const walletQuery = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const res = await walletApi.myBalance() as any;
      return res.data as WalletDetails;
    },
  });

  // Mutation: Deposit/Recharge available balance
  const rechargeMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await walletApi.recharge(amount);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['employee-dashboard'] });
    },
  });

  return {
    wallet: walletQuery.data || null,
    isLoading: walletQuery.isLoading,
    isError: walletQuery.isError,
    refetch: walletQuery.refetch,
    recharge: rechargeMutation.mutateAsync,
    isRecharging: rechargeMutation.isPending,
  };
}
