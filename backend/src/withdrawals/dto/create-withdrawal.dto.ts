import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min, IsString } from 'class-validator';

export class CreateWithdrawalDto {
  @ApiProperty({ example: 1000, description: 'Amount to withdraw (INR)' })
  @IsNumber()
  @Min(100)
  amount: number;

  @ApiProperty({
    example: 'IFSC: HDFC0001234, A/C: 50100234567890',
    description: 'Destination bank details',
  })
  @IsString()
  @IsNotEmpty()
  bankAccountDetails: string;
}
