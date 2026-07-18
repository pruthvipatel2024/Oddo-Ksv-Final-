import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserType } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'employee@company.com', description: 'The email address of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'The password (minimum 8 characters)' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '+919876543210', description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'ORG123', description: 'Organization invite code to bind the user' })
  @IsString()
  @IsNotEmpty()
  organizationCode: string;

  @ApiProperty({ example: 'EMP-001', description: 'Employee identifier code within the organization', required: false })
  @IsString()
  @IsOptional()
  employeeCode?: string;

  @ApiProperty({ enum: UserType, example: UserType.INTERNAL, description: 'Type of user (INTERNAL or EXTERNAL)' })
  @IsEnum(UserType)
  userType: UserType;

  @ApiProperty({ enum: UserRole, example: UserRole.PASSENGER, description: 'Desired role (PASSENGER or EMPLOYEE_DRIVER)' })
  @IsEnum(UserRole)
  role: UserRole;
}
