import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsDateString, IsBoolean } from 'class-validator';

export class UpdateVehicleDto {
  @ApiProperty({ example: 'Honda', description: 'The manufacturer of the vehicle', required: false })
  @IsString()
  @IsOptional()
  manufacturer?: string;

  @ApiProperty({ example: 'Civic', description: 'The model of the vehicle', required: false })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty({ example: 'Blue', description: 'The color of the vehicle', required: false })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ example: 4, description: 'Seating capacity', required: false })
  @IsInt()
  @Min(1)
  @Max(8)
  @IsOptional()
  seatingCapacity?: number;

  @ApiProperty({ example: '2026-12-31T00:00:00.000Z', description: 'Insurance expiry date', required: false })
  @IsDateString()
  @IsOptional()
  insuranceExpiry?: string;

  @ApiProperty({ example: '2026-06-30T00:00:00.000Z', description: 'Pollution certificate expiry date', required: false })
  @IsDateString()
  @IsOptional()
  pollutionExpiry?: string;

  @ApiProperty({ example: 'https://cloudinary.com/car.jpg', description: 'Photo of the vehicle', required: false })
  @IsString()
  @IsOptional()
  vehiclePhoto?: string;

  @ApiProperty({ example: true, description: 'Is vehicle active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
