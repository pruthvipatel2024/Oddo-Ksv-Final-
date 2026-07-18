/**
 * Razorpay payments wrapper.
 * Triggers Sandbox payments gateway.
 */
import { env } from '@/src/config/env';
import { logger } from '@/src/lib/logger';

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

export const checkoutService = {
  initializePayment: (
    order: { orderId: string; amount: number; currency: string },
    user: { firstName: string; lastName: string; email: string; phone: string },
    onSuccess: (paymentId: string) => void,
    onFailure: (error: any) => void
  ) => {
    logger.info(`Initializing Razorpay payment options for Order ID: ${order.orderId}`);
    
    const options: RazorpayOptions = {
      key: env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'RideShare Inc.',
      description: 'Wallet Recharge Transaction',
      order_id: order.orderId,
      handler: (response) => {
        logger.info('Razorpay payment authorization response received:', response);
        onSuccess(response.razorpay_payment_id);
      },
      prefill: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        contact: user.phone,
      },
      theme: {
        color: '#4f46e5', // indigo-600
      },
    };

    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      logger.warn('Razorpay SDK not loaded on window context. Executing sandbox success mock.');
      // Execute sandbox mock success simulation if SDK is not loaded
      setTimeout(() => {
        onSuccess(`pay_rzp_mock_${Date.now()}`);
      }, 1000);
    }
  }
};
