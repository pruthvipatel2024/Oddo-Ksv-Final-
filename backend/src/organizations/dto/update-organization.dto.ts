import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateOrganizationDto {
  @ApiProperty({ example: 'Tech Corp Inc.', description: 'The name of the organization', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'https://logo.url/logo.png', description: 'URL of the organization logo', required: false })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiProperty({ example: 'techcorp.com', description: 'Email domain associated with the organization', required: false })
  @IsString()
  @IsOptional()
  emailDomain?: string;

  @ApiProperty({ example: '123 Tech Park', description: 'Street address of the organization headquarters', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'Ahmedabad', description: 'City where the organization is located', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'Gujarat', description: 'State/Province where the organization is located', required: false })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ example: 'India', description: 'Country where the organization is located', required: false })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ example: 'ACTIVE', description: 'Status of the organization', required: false })
  @IsString()
  @IsOptional()
  status?: string;
}
