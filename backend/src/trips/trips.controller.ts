import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { UpdateTripStatusDto } from './dto/update-trip-status.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '@prisma/client';

@ApiTags('Trips')
@Controller({
  path: 'trips',
  version: '1',
})
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List user trips', description: 'Returns all trips the current user participates in (as driver or passenger).' })
  @ApiResponse({ status: 200, description: 'Return array of user trips.' })
  async findMyTrips(@CurrentUser() user: JwtPayload) {
    return {
      success: true,
      data: await this.tripsService.findByUser(user.sub),
    };
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get detailed trip info by ID', description: 'Access is limited to trip participants or Platform Super Admins.' })
  @ApiResponse({ status: 200, description: 'Return detailed trip information.' })
  @ApiResponse({ status: 403, description: 'Forbidden if cross-tenant.' })
  @ApiResponse({ status: 404, description: 'Trip not found.' })
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return {
      success: true,
      data: await this.tripsService.findById(
        id,
        user.role === UserRole.SUPER_ADMIN ? undefined : user.organizationId || undefined,
      ),
    };
  }

  @Patch(':id/status')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Transition trip status state', description: 'Enforces the trip state machine. Only the driver is allowed to start, complete, or cancel a trip.' })
  @ApiResponse({ status: 200, description: 'Trip status updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid state transition.' })
  @ApiResponse({ status: 403, description: 'Forbidden if not the driver.' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateTripStatusDto,
  ) {
    return {
      success: true,
      data: await this.tripsService.updateStatus(
        id,
        user.sub,
        user.organizationId!,
        dto,
      ),
    };
  }
}
