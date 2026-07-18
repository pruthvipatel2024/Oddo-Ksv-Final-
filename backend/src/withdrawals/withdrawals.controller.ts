import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { UpdateWithdrawalDto } from './dto/update-withdrawal.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '@prisma/client';

@ApiTags('Withdrawals')
@Controller({
  path: 'withdrawals',
  version: '1',
})
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post()
  @Roles(UserRole.EMPLOYEE)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit a new withdrawal request', description: 'Employees can withdraw earned funds to their bank accounts.' })
  @ApiResponse({ status: 201, description: 'Withdrawal request created.' })
  @ApiResponse({ status: 400, description: 'Insufficient balance or invalid details.' })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateWithdrawalDto) {
    return {
      success: true,
      data: await this.withdrawalsService.create(user.sub, dto),
    };
  }

  @Get()
  @Roles(UserRole.EMPLOYEE)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user withdrawal requests', description: 'List withdrawal requests history.' })
  @ApiResponse({ status: 200, description: 'Return requests array.' })
  async findMyWithdrawals(@CurrentUser() user: JwtPayload) {
    return {
      success: true,
      data: await this.withdrawalsService.findByUser(user.sub),
    };
  }

  @Get('all')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List all withdrawal requests in the platform', description: 'Restricted to Platform Super Admins.' })
  @ApiResponse({ status: 200, description: 'Return all requests.' })
  async findAll() {
    return {
      success: true,
      data: await this.withdrawalsService.findAll(),
    };
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Process a withdrawal request status', description: 'Super Admins can Approve, Complete, or Reject withdrawal payouts.' })
  @ApiResponse({ status: 200, description: 'Status updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid status transition.' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateWithdrawalDto) {
    return {
      success: true,
      data: await this.withdrawalsService.updateStatus(id, dto),
    };
  }
}
