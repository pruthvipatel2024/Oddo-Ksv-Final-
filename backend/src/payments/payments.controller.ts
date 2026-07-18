import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller({
  path: 'payments',
  version: '1',
})
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout')
  @ApiOperation({
    summary: 'Initiate a payment checkout order',
    description: 'Returns order ID to process checkout on frontend client.',
  })
  @ApiResponse({ status: 201, description: 'Order initialized.' })
  async checkout(@Body('bookingId') bookingId: string) {
    return {
      success: true,
      data: await this.paymentsService.createCheckout(bookingId),
    };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Stripe/Razorpay payment gateway webhook receiver',
    description:
      'Receives and confirms transactions via signature validations.',
  })
  @ApiResponse({ status: 200, description: 'Webhook acknowledged.' })
  async webhook(
    @Headers('x-razorpay-signature') signature: string,
    @Body() payload: any,
  ) {
    const verified = await this.paymentsService.processWebhook(
      payload,
      signature,
    );
    return {
      success: verified,
    };
  }
}
