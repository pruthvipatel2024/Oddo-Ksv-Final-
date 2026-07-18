import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VerifyVehicleDto } from './dto/verify-vehicle.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '@prisma/client';

@ApiTags('Vehicles')
@Controller({
  path: 'vehicles',
  version: '1',
})
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @Roles(UserRole.EMPLOYEE)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Register a new vehicle',
    description: 'Registers a vehicle to support publishing rides.',
  })
  @ApiResponse({ status: 201, description: 'Vehicle registered successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(
    @CurrentUser() driver: JwtPayload,
    @Body() dto: CreateVehicleDto,
  ) {
    return {
      success: true,
      data: await this.vehiclesService.create(driver.sub, dto),
    };
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'List all vehicles',
    description:
      'Employees retrieve their own vehicles. Admins get records scoped to their bounds.',
  })
  @ApiResponse({ status: 200, description: 'Return array of vehicles.' })
  async findAll(@CurrentUser() user: JwtPayload) {
    if (user.role === UserRole.SUPER_ADMIN) {
      return {
        success: true,
        data: await this.vehiclesService.findAll(),
      };
    }

    if (user.role === UserRole.ORGANIZATION_ADMIN) {
      return {
        success: true,
        data: await this.vehiclesService.findAll(
          user.organizationId || undefined,
        ),
      };
    }

    // Employee retrieves their own vehicles
    return {
      success: true,
      data: await this.vehiclesService.findByOwnerId(user.sub),
    };
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get vehicle by ID',
    description: 'Access is limited to the vehicle owner or Admins.',
  })
  @ApiResponse({ status: 200, description: 'Return vehicle details.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Vehicle not found.' })
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return {
      success: true,
      data: await this.vehiclesService.findById(
        id,
        user.sub,
        user.role,
        user.organizationId || undefined,
      ),
    };
  }

  @Patch(':id')
  @Roles(UserRole.EMPLOYEE)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update vehicle details',
    description: 'Allows owner to update color, seating capacity, or photo.',
  })
  @ApiResponse({ status: 200, description: 'Vehicle updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Vehicle not found.' })
  async update(
    @Param('id') id: string,
    @CurrentUser() driver: JwtPayload,
    @Body() dto: UpdateVehicleDto,
  ) {
    return {
      success: true,
      data: await this.vehiclesService.update(id, driver.sub, dto),
    };
  }

  @Delete(':id')
  @Roles(UserRole.EMPLOYEE)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a registered vehicle',
    description: 'Soft deletes the vehicle record.',
  })
  @ApiResponse({ status: 200, description: 'Vehicle deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Vehicle not found.' })
  async delete(@Param('id') id: string, @CurrentUser() driver: JwtPayload) {
    return {
      success: true,
      data: await this.vehiclesService.delete(id, driver.sub),
    };
  }

  @Patch(':id/verify')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Verify vehicle registration status',
    description:
      'Allows Admins to verify, suspend, or reject registered vehicles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle verification status updated.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Vehicle not found.' })
  async verify(
    @Param('id') id: string,
    @CurrentUser() admin: JwtPayload,
    @Body() dto: VerifyVehicleDto,
  ) {
    return {
      success: true,
      data: await this.vehiclesService.verify(
        id,
        dto.status,
        admin.role === UserRole.SUPER_ADMIN
          ? undefined
          : admin.organizationId || undefined,
      ),
    };
  }
}
