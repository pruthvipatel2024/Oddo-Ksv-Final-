import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserStatus } from '@prisma/client';

export class UpdateUserStatusDto {
  @ApiProperty({ enum: UserStatus, example: 'ACTIVE' })
  @IsEnum(UserStatus)
  @IsNotEmpty()
  status: UserStatus;
}
