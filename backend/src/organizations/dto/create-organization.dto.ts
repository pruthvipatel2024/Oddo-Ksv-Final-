import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsPositive } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Tech Corp Inc.', description: 'The name of the organization' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'CORPA', description: 'Unique registration code used by employees during signup' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 100.0, description: 'Fuel cost per litre set by org administrator' })
  @IsNumber()
  @IsPositive()
  fuelCostPerLitre: number;

  @ApiProperty({ example: 15.0, description: 'Commuting cost per kilometer rate' })
  @IsNumber()
  @IsPositive()
  costPerKm: number;
}
