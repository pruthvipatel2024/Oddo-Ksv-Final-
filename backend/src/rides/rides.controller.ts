import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RidesService } from './rides.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { SearchRideDto } from './dto/search-ride.dto';
import { ConfirmRouteDto } from './dto/confirm-route.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '@prisma/client';

@ApiTags('Rides')
@Controller({
  path: 'rides',
  version: '1',
})
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @Post('confirm-route')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Calculate and confirm route details', description: 'Mandatory pre-step for both publishing (Offering) and searching (Finding) rides.' })
  @ApiResponse({ status: 200, description: 'Route metrics and polyline computed.' })
  async confirmRoute(@Body() dto: ConfirmRouteDto) {
    return this.ridesService.confirmRoute(dto);
  }

  @Post()
  @Roles(UserRole.EMPLOYEE_DRIVER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Offer / Publish a new ride', description: 'Restricted to Employee Drivers. The driver must have a verified active vehicle.' })
  @ApiResponse({ status: 201, description: 'Ride published successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid coordinate values, seating limits, or unverified vehicle.' })
  async create(@CurrentUser() driver: JwtPayload, @Body() dto: CreateRideDto) {
    return {
      success: true,
      data: await this.ridesService.create(driver.sub, driver.organizationId!, dto),
    };
  }

  @Get('search')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Find matching rides', description: 'Search results are strictly isolated to the user’s organization. Matches are filtered using a 2 km coordinate radius.' })
  @ApiResponse({ status: 200, description: 'Return array of matched rides.' })
  async search(@CurrentUser() user: JwtPayload, @Query() query: SearchRideDto) {
    return {
      success: true,
      data: await this.ridesService.search(user.organizationId!, query),
    };
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get ride profile by ID', description: 'Retrieves ride details including bookings. Isolation checks are applied.' })
  @ApiResponse({ status: 200, description: 'Return ride details.' })
  @ApiResponse({ status: 403, description: 'Forbidden if accessing another org’s ride.' })
  @ApiResponse({ status: 404, description: 'Ride not found.' })
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return {
      success: true,
      data: await this.ridesService.findDetail(
        id,
        user.role === UserRole.SUPER_ADMIN ? undefined : user.organizationId || undefined,
      ),
    };
  }

  @Delete(':id')
  @Roles(UserRole.EMPLOYEE_DRIVER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel published ride', description: 'Restricted to the driver who published it. Cancelling is blocked if the trip has started.' })
  @ApiResponse({ status: 200, description: 'Ride cancelled successfully.' })
  @ApiResponse({ status: 400, description: 'Cannot cancel active or completed rides.' })
  @ApiResponse({ status: 403, description: 'Forbidden if not the ride publisher.' })
  async cancel(@Param('id') id: string, @CurrentUser() driver: JwtPayload) {
    return {
      success: true,
      data: await this.ridesService.cancel(id, driver.sub),
    };
  }
}
