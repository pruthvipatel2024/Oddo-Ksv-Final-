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

  @ApiPropertyOptional({ example: 'https://logo.url/logo.png', description: 'URL of the organization logo' })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional({ example: 'techcorp.com', description: 'Email domain associated with the organization' })
  @IsString()
  @IsOptional()
  emailDomain?: string;

  @ApiProperty({ example: '123 Tech Park', description: 'Street address of the organization headquarters' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Ahmedabad', description: 'City where the organization is located' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Gujarat', description: 'State/Province where the organization is located' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: 'India', description: 'Country where the organization is located' })
  @IsString()
  @IsNotEmpty()
  country: string;
}
