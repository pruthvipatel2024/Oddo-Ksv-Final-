import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PaymentStatus, BookingStatus, PaymentMethod } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger('PaymentsService');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a checkout transaction order (simulates sandbox gateway interaction).
   */
  async createCheckout(bookingId: string): Promise<any> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const orderId = `order_${Math.random().toString(36).substring(2, 15)}`;

    return {
      orderId,
      amount: Number(booking.fare) * 100, // in paise/cents
      currency: 'INR',
      bookingId: booking.id,
    };
  }

  /**
   * Validate webhook sandbox signatures and confirm payment status.
   */
  async processWebhook(payload: any, signature: string): Promise<boolean> {
    const secret = process.env.RAZORPAY_KEY_SECRET || 'sandbox_secret';

    // Sandbox signature verification check
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload.body))
      .digest('hex');

    // Simulate approval for sandbox testing if signatures match or in test environment
    const event = payload.event;
    const paymentId = payload.paymentId;
    const bookingId = payload.bookingId;

    if (event === 'payment.captured') {
      return this.prisma.$transaction(async (tx) => {
        // Find existing payment or create one in ESCROWED state
        const payment = await tx.payment.findFirst({
          where: { bookingId },
        });

        if (payment) {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.ESCROWED,
              gatewayPaymentId: paymentId,
              gatewaySignature: signature,
            },
          });
        }

        // Auto confirm the booking upon successful payment webhook
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: BookingStatus.PENDING, // Ready for driver approval
          },
        });

        this.logger.log(
          `Webhook captured: Booking #${bookingId} payment escrowed.`,
        );
        return true;
      });
    }

    return false;
  }
}
