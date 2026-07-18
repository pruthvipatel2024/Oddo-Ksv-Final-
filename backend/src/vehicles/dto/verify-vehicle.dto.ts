import { ApiProperty } from '@nestjs/swagger';
import { VehicleVerificationStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class VerifyVehicleDto {
  @ApiProperty({ enum: VehicleVerificationStatus, example: VehicleVerificationStatus.VERIFIED, description: 'Verification decision' })
  @IsEnum(VehicleVerificationStatus)
  @IsNotEmpty()
  status: VehicleVerificationStatus;
}
