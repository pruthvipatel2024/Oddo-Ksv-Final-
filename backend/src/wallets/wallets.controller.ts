import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { RechargeWalletDto } from './dto/recharge-wallet.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Wallet')
@Controller({
  path: 'wallets',
  version: '1',
})
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('my-balance')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user wallet details', description: 'Returns wallet balance and the 10 most recent transaction ledger records.' })
  @ApiResponse({ status: 200, description: 'Return wallet properties.' })
  async getMyWallet(@CurrentUser() user: JwtPayload) {
    return {
      success: true,
      data: await this.walletsService.findByUserId(user.sub),
    };
  }

  @Post('recharge')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Deposit funds to wallet', description: 'Simulates depositing credits. In production, this validates a processed Razorpay order.' })
  @ApiResponse({ status: 201, description: 'Funds credited successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid amount bounds.' })
  async recharge(@CurrentUser() user: JwtPayload, @Body() dto: RechargeWalletDto) {
    return {
      success: true,
      data: await this.walletsService.recharge(user.sub, dto.amount),
    };
  }
}
