import { apiClient } from './client';

export interface WalletTransaction {
  id: string;
  walletId: string;
  userId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'CREDIT' | 'DEBIT' | 'REFUND';
  amount: number;
  description?: string;
  createdAt: string;
}

export interface WalletDetails {
  id: string;
  userId: string;
  availableBalance: number;
  pendingEarnings: number;
  transactions: WalletTransaction[];
}

export const walletApi = {
  myBalance: () => 
    apiClient.get<{ success: boolean; data: WalletDetails }>('/wallets/my-balance'),

  recharge: (amount: number) => 
    apiClient.post<{ success: boolean; data: WalletDetails }>('/wallets/recharge', { amount }),
};
