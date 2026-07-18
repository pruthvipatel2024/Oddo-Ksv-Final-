import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsDateString, IsInt, Min, IsOptional } from 'class-validator';
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
}
