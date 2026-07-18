import { apiClient } from '../client';

export interface CreateWithdrawalPayload {
  amount: number;
  bankAccountDetails: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  bankAccountDetails: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  transactionReference?: string;
  createdAt: string;
  updatedAt: string;
}

export const withdrawalsApi = {
  create: (payload: CreateWithdrawalPayload) => 
    apiClient.post<{ success: boolean; data: WithdrawalRequest }>('/withdrawals', payload),

  findMyWithdrawals: () => 
    apiClient.get<{ success: boolean; data: WithdrawalRequest[] }>('/withdrawals'),

  findAll: () => 
    apiClient.get<{ success: boolean; data: WithdrawalRequest[] }>('/withdrawals/all'),

  updateStatus: (id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED', transactionReference?: string) => 
    apiClient.patch<{ success: boolean; data: WithdrawalRequest }>(`/withdrawals/${id}/status`, { status, transactionReference }),
};
