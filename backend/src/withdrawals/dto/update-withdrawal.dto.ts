import { ApiProperty } from '@nestjs/swagger';
import { WithdrawalStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateWithdrawalDto {
  @ApiProperty({
    enum: WithdrawalStatus,
    example: WithdrawalStatus.APPROVED,
    description: 'Target withdrawal status decision',
  })
  @IsEnum(WithdrawalStatus)
  @IsNotEmpty()
  status: WithdrawalStatus;

  @ApiProperty({
    example: 'TXN-987654321',
    description: 'Reference ID of bank transaction transfer',
    required: false,
  })
  @IsString()
  @IsOptional()
  transactionReference?: string;
}
