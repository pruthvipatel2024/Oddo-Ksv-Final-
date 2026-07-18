import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ConfirmRouteDto {
  @ApiProperty({ example: 18.5204, description: 'Pickup latitude coordinate' })
  @IsNumber()
  pickupLat: number;

  @ApiProperty({ example: 73.8567, description: 'Pickup longitude coordinate' })
  @IsNumber()
  pickupLng: number;

  @ApiProperty({ example: 18.559, description: 'Destination latitude coordinate' })
  @IsNumber()
  destinationLat: number;

  @ApiProperty({ example: 73.9272, description: 'Destination longitude coordinate' })
  @IsNumber()
  destinationLng: number;
}
