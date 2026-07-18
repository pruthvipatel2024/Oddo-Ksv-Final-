import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({
    example: 'Honda',
    description: 'The manufacturer of the vehicle',
  })
  @IsString()
  @IsNotEmpty()
  manufacturer: string;

  @ApiProperty({ example: 'Civic', description: 'The model of the vehicle' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ example: 'Black', description: 'The color of the vehicle' })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({
    example: 'MH-12-XX-1234',
    description: 'Unique vehicle registration number',
  })
  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @ApiProperty({
    example: 4,
    description: 'Seating capacity (excluding driver)',
  })
  @IsInt()
  @Min(1)
  @Max(8)
  seatingCapacity: number;

  @ApiProperty({
    example: '2026-12-31T00:00:00.000Z',
    description: 'Insurance expiry date',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  insuranceExpiry?: string;

  @ApiProperty({
    example: '2026-06-30T00:00:00.000Z',
    description: 'Pollution certificate expiry date',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  pollutionExpiry?: string;

  @ApiProperty({
    example: 'https://cloudinary.com/car.jpg',
    description: 'Photo of the vehicle',
    required: false,
  })
  @IsString()
  @IsOptional()
  vehiclePhoto?: string;
}
