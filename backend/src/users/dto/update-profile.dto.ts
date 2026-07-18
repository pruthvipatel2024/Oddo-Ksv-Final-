import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'John', description: 'Updated first name', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe', description: 'Updated last name', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: '+919876543210', description: 'Updated phone number', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'EMP-002', description: 'Updated employee code', required: false })
  @IsString()
  @IsOptional()
  employeeCode?: string;

  @ApiProperty({ example: 'https://cloudinary.com/avatar.jpg', description: 'Updated avatar image URL', required: false })
  @IsString()
  @IsOptional()
  avatar?: string;
}
