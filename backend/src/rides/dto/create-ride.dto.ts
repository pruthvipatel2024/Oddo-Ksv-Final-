import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsInt,
  Min,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class CreateRideDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID of the verified driver vehicle to use' })
  @IsUUID()
  @IsNotEmpty()
  vehicleId: string;

  @ApiProperty({ example: 'Office Building A, Pune', description: 'Pickup location text address' })
  @IsString()
  @IsNotEmpty()
  pickupAddress: string;

  @ApiProperty({ example: 18.5204, description: 'Pickup latitude coordinate' })
  @IsNumber()
  pickupLat: number;

  @ApiProperty({ example: 73.8567, description: 'Pickup longitude coordinate' })
  @IsNumber()
  pickupLng: number;

  @ApiProperty({ example: 'ChIJK0-9_XXXXX', description: 'Google Place ID for pickup', required: false })
  @IsString()
  @IsOptional()
  pickupPlaceId?: string;

  @ApiProperty({ example: 'Tech Park Tower 2, Pune', description: 'Destination location text address' })
  @IsString()
  @IsNotEmpty()
  destinationAddress: string;

  @ApiProperty({ example: 18.559, description: 'Destination latitude coordinate' })
  @IsNumber()
  destinationLat: number;

  @ApiProperty({ example: 73.9272, description: 'Destination longitude coordinate' })
  @IsNumber()
  destinationLng: number;

  @ApiProperty({ example: 'ChIJK0-9_YYYYY', description: 'Google Place ID for destination', required: false })
  @IsString()
  @IsOptional()
  destinationPlaceId?: string;

  @ApiProperty({ example: '2026-07-20T00:00:00.000Z', description: 'Date of travel' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '08:30', description: 'Departure time (HH:MM format)' })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({ example: 3, description: 'Total available seats in the vehicle' })
  @IsInt()
  @Min(1)
  availableSeats: number;

  @ApiProperty({ example: 150.0, description: 'Fare charge per seat' })
  @IsNumber()
  @Min(0)
  farePerSeat: number;

  @ApiProperty({ example: false, description: 'Whether this ride repeats daily/weekly', required: false })
  @IsBoolean()
  @IsOptional()
  recurring?: boolean;
}
