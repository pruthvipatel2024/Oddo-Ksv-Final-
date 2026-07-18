import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ForbiddenException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserStatusDto } from './dto/update-status.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Users & Profile')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return profile details.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProfile(@CurrentUser() currentUser: JwtPayload) {
    const user = await this.usersService.findById(currentUser.sub);
    const { passwordHash, refreshTokenHash, ...cleanUser } = user as any;
    return { success: true, data: cleanUser };
  }

  @Patch('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  async updateProfile(
    @CurrentUser() currentUser: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    const user = await this.usersService.update(
      currentUser.sub,
      dto,
      currentUser.role === UserRole.SUPER_ADMIN
        ? undefined
        : currentUser.organizationId || undefined,
    );
    const { passwordHash, refreshTokenHash, ...cleanUser } = user as any;
    return { success: true, data: cleanUser };
  }

  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change current user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid current password.' })
  async changePassword(
    @CurrentUser() currentUser: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(
      currentUser.sub,
      dto.oldPassword,
      dto.newPassword,
    );
    return { success: true, message: 'Password changed successfully' };
  }

  // ─── Dashboard endpoints ───────────────────────────────────────────────────

  /**
   * Employee dashboard: upcoming bookings, offered rides, vehicles.
   */
  @Get('dashboard/employee')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Employee dashboard',
    description:
      'Returns upcoming bookings, offered rides, and vehicle list for the current employee.',
  })
  @ApiResponse({ status: 200, description: 'Employee dashboard data.' })
  async employeeDashboard(@CurrentUser() currentUser: JwtPayload) {
    return {
      success: true,
      data: await this.usersService.getEmployeeDashboard(currentUser.sub),
    };
  }

  /**
   * Org-admin dashboard: commute stats, vehicle approval queue, ride history.
   */
  @Get('dashboard/org-admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Organization admin dashboard',
    description:
      'Returns employee counts, carbon savings, pending vehicle approvals, and recent ride history.',
  })
  @ApiResponse({ status: 200, description: 'Org-admin dashboard data.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – requires ORGANIZATION_ADMIN or SUPER_ADMIN role.',
  })
  async orgAdminDashboard(@CurrentUser() currentUser: JwtPayload) {
    if (
      currentUser.role !== UserRole.ORGANIZATION_ADMIN &&
      currentUser.role !== UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'Org admin dashboard is restricted to ORGANIZATION_ADMIN and SUPER_ADMIN roles',
      );
    }
    const orgId =
      currentUser.role === UserRole.SUPER_ADMIN
        ? undefined
        : currentUser.organizationId || undefined;
    return {
      success: true,
      data: await this.usersService.getOrgAdminDashboard(orgId),
    };
  }

  /**
   * Super-admin dashboard: platform-wide revenue, commission, active listings.
   */
  @Get('dashboard/super-admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Super admin platform dashboard',
    description:
      'Returns platform-wide aggregates: total orgs, employees, trips, revenue, and commission.',
  })
  @ApiResponse({ status: 200, description: 'Super admin dashboard data.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – requires SUPER_ADMIN role.',
  })
  async superAdminDashboard(@CurrentUser() currentUser: JwtPayload) {
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Super admin dashboard is restricted to SUPER_ADMIN role',
      );
    }
    return {
      success: true,
      data: await this.usersService.getSuperAdminDashboard(),
    };
  }

  // ─── User lookup ───────────────────────────────────────────────────────────

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get user profile by ID',
    description:
      'Retrieves any verified user profile in the marketplace. Passwords are never returned.',
  })
  @ApiResponse({ status: 200, description: 'Return user details.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    // SUPER_ADMIN can see anyone; others can look up any user (marketplace is global)
    const user = await this.usersService.findById(id);
    const { passwordHash, refreshTokenHash, ...cleanUser } = user as any;
    return { success: true, data: cleanUser };
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'List all organization employees',
    description: "Restricted to Admins. Scopes result to requester's org.",
  })
  @ApiResponse({ status: 200, description: 'Return array of employees.' })
  async findAll(@CurrentUser() currentUser: JwtPayload) {
    const orgId =
      currentUser.role === UserRole.SUPER_ADMIN
        ? undefined
        : currentUser.organizationId || undefined;
    const users = await this.usersService.findAll(orgId);

    // Strip passwords and tokens
    const cleanUsers = users.map((user) => {
      const { passwordHash, refreshTokenHash, ...clean } = user as any;
      return clean;
    });

    return { success: true, data: cleanUsers };
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Suspend or activate an employee profile',
    description: 'Restricted to Admins.',
  })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully.',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() admin: JwtPayload,
  ) {
    const orgId =
      admin.role === UserRole.SUPER_ADMIN
        ? undefined
        : admin.organizationId || undefined;
    const user = await this.usersService.updateStatus(id, dto.status, orgId);
    const { passwordHash, refreshTokenHash, ...cleanUser } = user as any;
    return { success: true, data: cleanUser };
  }
}
