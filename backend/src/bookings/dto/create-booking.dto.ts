import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, Min, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'The ID of the ride to book' })
  @IsUUID()
  @IsNotEmpty()
  rideId: string;

  @ApiProperty({ example: 1, description: 'Number of seats to book' })
  @IsInt()
  @Min(1)
  seatsBooked: number;
}
