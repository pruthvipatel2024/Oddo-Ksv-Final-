import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '@prisma/client';

@ApiTags('Users & Profile')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile', description: 'Returns the profile details of the currently authenticated user.' })
  @ApiResponse({ status: 200, description: 'Return profile details.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProfile(@CurrentUser() currentUser: JwtPayload) {
    const user = await this.usersService.findById(currentUser.sub);
    const { passwordHash, refreshTokenHash, ...cleanUser } = user;
    return {
      success: true,
      data: cleanUser,
    };
  }

  @Patch('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update current user profile', description: 'Allows updating first name, last name, phone, employee code, and avatar.' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async updateProfile(
    @CurrentUser() currentUser: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    const user = await this.usersService.update(
      currentUser.sub,
      dto,
      currentUser.role === UserRole.SUPER_ADMIN ? undefined : currentUser.organizationId || undefined,
    );
    const { passwordHash, refreshTokenHash, ...cleanUser } = user;
    return {
      success: true,
      data: cleanUser,
    };
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user details by ID', description: 'Retrieves another user’s profile. Access is strictly scoped to the same organization.' })
  @ApiResponse({ status: 200, description: 'Return user details.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Cross-tenant queries are blocked.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: JwtPayload) {
    // Standard users can only retrieve profiles belonging to the same organization
    const orgFilter = currentUser.role === UserRole.SUPER_ADMIN ? undefined : currentUser.organizationId || undefined;
    const user = await this.usersService.findById(id, orgFilter);
    const { passwordHash, refreshTokenHash, ...cleanUser } = user;
    return {
      success: true,
      data: cleanUser,
    };
  }
}
