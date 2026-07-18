import { apiClient } from './client';

export interface CheckoutResult {
  orderId: string;
  amount: number;
  currency: string;
  bookingId: string;
}

export const paymentsApi = {
  checkout: (bookingId: string) => 
    apiClient.post<{ success: boolean; data: CheckoutResult }>('/payments/checkout', { bookingId }),
};
