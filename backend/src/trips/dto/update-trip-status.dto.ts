import { ApiProperty } from '@nestjs/swagger';
import { TripStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateTripStatusDto {
  @ApiProperty({ enum: TripStatus, example: TripStatus.STARTED, description: 'Target state status' })
  @IsEnum(TripStatus)
  @IsNotEmpty()
  status: TripStatus;

  @ApiProperty({ example: '18.5204,73.8567', description: 'Actual GPS coordinates at start', required: false })
  @IsString()
  @IsOptional()
  actualStartLocation?: string;

  @ApiProperty({ example: '18.5590,73.9272', description: 'Actual GPS coordinates at drop', required: false })
  @IsString()
  @IsOptional()
  actualEndLocation?: string;
}
