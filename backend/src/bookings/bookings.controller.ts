import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '@prisma/client';

@ApiTags('Bookings')
@Controller({
  path: 'bookings',
  version: '1',
})
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Roles(UserRole.PASSENGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Request a ride booking', description: 'Restricted to Passengers. Creates a reservation request that the driver can approve.' })
  @ApiResponse({ status: 201, description: 'Booking request registered.' })
  @ApiResponse({ status: 400, description: 'Bad Request. Drivers cannot book their own rides.' })
  @ApiResponse({ status: 409, description: 'Conflict. Active booking request already exists.' })
  async create(@CurrentUser() passenger: JwtPayload, @Body() dto: CreateBookingDto) {
    return {
      success: true,
      data: await this.bookingsService.create(passenger.sub, passenger.organizationId!, dto),
    };
  }

  @Get()
  @Roles(UserRole.PASSENGER, UserRole.EMPLOYEE_DRIVER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List passenger bookings', description: 'Returns a history of booking requests made by the current user.' })
  @ApiResponse({ status: 200, description: 'Return array of passenger bookings.' })
  async findAll(@CurrentUser() user: JwtPayload) {
    return {
      success: true,
      data: await this.bookingsService.findByPassenger(user.sub),
    };
  }

  @Get('ride/:rideId')
  @Roles(UserRole.EMPLOYEE_DRIVER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List bookings for a specific ride', description: 'Restricted to the driver who published the ride.' })
  @ApiResponse({ status: 200, description: 'Return array of bookings.' })
  @ApiResponse({ status: 403, description: 'Forbidden if not the ride publisher.' })
  async findByRide(@Param('rideId') rideId: string, @CurrentUser() driver: JwtPayload) {
    return {
      success: true,
      data: await this.bookingsService.findByRide(rideId, driver.sub),
    };
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get booking details by ID', description: 'Retrieves specific booking details. Access checks are applied.' })
  @ApiResponse({ status: 200, description: 'Return booking details.' })
  @ApiResponse({ status: 403, description: 'Forbidden if cross-tenant.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return {
      success: true,
      data: await this.bookingsService.findById(
        id,
        user.role === UserRole.SUPER_ADMIN ? undefined : user.organizationId || undefined,
      ),
    };
  }

  @Patch(':id/status')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update booking status', description: 'Allows drivers to approve or reject requests, and passengers/drivers to cancel confirmed reservations.' })
  @ApiResponse({ status: 200, description: 'Booking status updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid state transitions.' })
  @ApiResponse({ status: 403, description: 'Forbidden if requester is not authorized.' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return {
      success: true,
      data: await this.bookingsService.updateStatus(
        id,
        user.sub,
        user.organizationId!,
        dto,
      ),
    };
  }
}
