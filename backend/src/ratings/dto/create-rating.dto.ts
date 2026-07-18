import { ApiProperty } from '@nestjs/swagger';
import { RatingType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateRatingDto {
  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    description: 'The related Trip ID',
  })
  @IsString()
  @IsNotEmpty()
  tripId: string;

  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    description: 'User ID of the person being rated',
  })
  @IsString()
  @IsNotEmpty()
  revieweeId: string;

  @ApiProperty({ example: 5, description: 'Rating value between 1 and 5' })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: 'Great driver, arrived on time!',
    description: 'Optional feedback comments',
    required: false,
  })
  @IsString()
  @IsOptional()
  reviewText?: string;

  @ApiProperty({
    enum: RatingType,
    example: RatingType.PASSENGER_TO_DRIVER,
    description: 'Directional role verification',
  })
  @IsEnum(RatingType)
  @IsNotEmpty()
  type: RatingType;
}
