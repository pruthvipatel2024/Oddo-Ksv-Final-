import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Tech Corp Inc.', description: 'The name of the organization' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'CORPA', description: 'Unique registration code used by employees during signup' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: 'tech.corp', description: 'Email domain for employee auto-verification' })
  @IsString()
  @IsOptional()
  emailDomain?: string;

  @ApiProperty({ example: '123 Main Street', description: 'Office address' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Bengaluru', description: 'City' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Karnataka', description: 'State / Province' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: 'India', description: 'Country' })
  @IsString()
  @IsNotEmpty()
  country: string;
}
