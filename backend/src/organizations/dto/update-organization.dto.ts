import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsPositive } from 'class-validator';

export class UpdateOrganizationDto {
  @ApiProperty({ example: 'Tech Corp Inc.', description: 'The name of the organization', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 105.5, description: 'Updated fuel cost per litre', required: false })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  fuelCostPerLitre?: number;

  @ApiProperty({ example: 16.0, description: 'Updated cost per kilometer rate', required: false })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  costPerKm?: number;
}
