import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsDateString, IsInt, Min, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchRideDto {
  @ApiProperty({ example: 18.5204, description: 'Pickup latitude coordinate' })
  @IsNumber()
  @Type(() => Number)
  pickupLat: number;

  @ApiProperty({ example: 73.8567, description: 'Pickup longitude coordinate' })
  @IsNumber()
  @Type(() => Number)
  pickupLng: number;

  @ApiProperty({ example: 18.559, description: 'Destination latitude coordinate' })
  @IsNumber()
  @Type(() => Number)
  destinationLat: number;

  @ApiProperty({ example: 73.9272, description: 'Destination longitude coordinate' })
  @IsNumber()
  @Type(() => Number)
  destinationLng: number;

  @ApiProperty({ example: '2026-07-20T00:00:00.000Z', description: 'Date of travel' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 1, description: 'Number of passenger seats needed', required: false })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  seatsNeeded?: number = 1;

  @ApiProperty({ example: 2000, description: 'Pickup detour radius in meters', required: false })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  pickupRadius?: number = 2000;

  @ApiProperty({ example: 2000, description: 'Destination detour radius in meters', required: false })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  destinationRadius?: number = 2000;

  @ApiProperty({ example: 30, description: 'Departure time buffer window in minutes', required: false })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  timeWindowMinutes?: number = 30;

  @ApiProperty({ example: 4.0, description: 'Minimum driver rating filter', required: false })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  minDriverRating?: number;

  @ApiProperty({ example: 'Sedan', description: 'Vehicle type/category filter', required: false })
  @IsString()
  @IsOptional()
  vehicleType?: string;

  @ApiProperty({ example: 500, description: 'Maximum price per seat', required: false })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  maxPrice?: number;
}
