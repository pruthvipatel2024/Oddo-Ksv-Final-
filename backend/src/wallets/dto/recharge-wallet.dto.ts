import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max } from 'class-validator';

export class RechargeWalletDto {
  @ApiProperty({ example: 500, description: 'Amount to add to wallet (INR)' })
  @IsNumber()
  @Min(10)
  @Max(50000)
  amount: number;
}
