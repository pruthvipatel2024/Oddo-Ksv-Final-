import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Booking, BookingStatus, TripStatus, ParticipantRole } from '@prisma/client';
import { BookingsRepository } from './bookings.repository';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { RidesService } from '../rides/rides.service';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger('BookingsService');

  constructor(
    private readonly bookingsRepository: BookingsRepository,
    private readonly ridesService: RidesService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Request a new ride booking.
   */
  async create(passengerId: string, organizationId: string, dto: CreateBookingDto): Promise<Booking> {
    // 1. Verify ride exists and belongs to the passenger's organization
    const ride = await this.ridesService.findById(dto.rideId, organizationId);

    // 2. Prevent driver from booking their own ride
    if (ride.driverId === passengerId) {
      throw new BadRequestException('Drivers cannot book their own rides');
    }

    // 3. Check for duplicates
    const activeBooking = await this.bookingsRepository.findUserActiveBookingOnRide(passengerId, dto.rideId);
    if (activeBooking) {
      throw new ConflictException('You already have an active booking request for this ride');
    }

    // 4. Generate unique booking reference (e.g. BCK-YYYYMMDD-XXXX)
    const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    const bookingReference = `BCK-${Date.now().toString().substring(5, 10)}-${randomCode}`;

    // 5. Calculate total fare
    const fare = Number(ride.farePerSeat) * dto.seatsBooked;

    return this.bookingsRepository.create({
      bookingReference,
      seatsBooked: dto.seatsBooked,
      fare,
      status: BookingStatus.PENDING,
      rideId: dto.rideId,
      passengerId,
    });
  }

  /**
   * Get booking details. Enforces organization isolation.
   */
  async findById(id: string, organizationId?: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findDetailById(id, organizationId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  /**
   * Find bookings for the passenger.
   */
  async findByPassenger(passengerId: string): Promise<Booking[]> {
    return this.bookingsRepository.findByPassengerId(passengerId);
  }

  /**
   * Find bookings for a ride (Driver view).
   */
  async findByRide(rideId: string, driverId: string): Promise<Booking[]> {
    const ride = await this.ridesService.findById(rideId);
    if (ride.driverId !== driverId) {
      throw new ForbiddenException('You did not publish this ride');
    }
    return this.bookingsRepository.findByRideId(rideId);
  }

  /**
   * Update booking status (Approval, Rejection, Cancellation) with seat updates.
   */
  async updateStatus(
    id: string,
    userId: string,
    organizationId: string,
    dto: UpdateBookingStatusDto,
  ): Promise<Booking> {
    const booking = await this.bookingsRepository.findDetailById(id, organizationId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const ride = booking.ride;

    switch (dto.status) {
      case BookingStatus.CONFIRMED:
        return this.approveBooking(booking, ride, userId);
      
      case BookingStatus.REJECTED:
        return this.rejectBooking(booking, ride, userId, dto.cancelReason);

      case BookingStatus.CANCELLED:
        return this.cancelBooking(booking, ride, userId, dto.cancelReason);

      case BookingStatus.NO_SHOW:
      case BookingStatus.EXPIRED:
        return this.markNoShowOrExpired(booking, ride, userId, dto.status);

      default:
        throw new BadRequestException('Invalid booking status transition');
    }
  }

  /**
   * Approve booking (Driver only) - Decrements seats and provisions Trip.
   */
  private async approveBooking(booking: any, ride: any, driverId: string): Promise<Booking> {
    if (ride.driverId !== driverId) {
      throw new ForbiddenException('Only the driver can approve booking requests');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Can only approve pending bookings');
    }

    // Run within a transaction to guarantee atomic seat decrements
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch ride details to check available seats (locks the record)
      const currentRide = await tx.ride.findUnique({
        where: { id: ride.id },
      });

      if (!currentRide) {
        throw new NotFoundException('Associated ride not found');
      }

      if (currentRide.availableSeats < booking.seatsBooked) {
        throw new BadRequestException('Not enough seats available on this ride');
      }

      // 2. Decrement available seats
      const updatedRide = await tx.ride.update({
        where: { id: ride.id },
        data: {
          availableSeats: currentRide.availableSeats - booking.seatsBooked,
        },
      });

      // 3. If seats are now 0, auto-mark ride as FULL
      if (updatedRide.availableSeats === 0) {
        await tx.ride.update({
          where: { id: ride.id },
          data: { status: 'FULL' },
        });
      }

      // 4. Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CONFIRMED,
          approvedBy: driverId,
        },
      });

      // 5. Retrieve or provision Trip record (1:1 with confirmed Ride)
      let trip = await tx.trip.findUnique({
        where: { rideId: ride.id },
      });

      if (!trip) {
        // Create trip
        trip = await tx.trip.create({
          data: {
            rideId: ride.id,
            status: TripStatus.BOOKED,
          },
        });

        // Add Driver to Trip Participants
        await tx.tripParticipant.create({
          data: {
            tripId: trip.id,
            userId: ride.driverId,
            role: ParticipantRole.DRIVER,
          },
        });

        // Create Chat Conversation scoped to the trip
        await tx.conversation.create({
          data: {
            tripId: trip.id,
          },
        });
      }

      // Add Passenger to Trip Participants (if not already there)
      const existingParticipant = await tx.tripParticipant.findUnique({
        where: {
          tripId_userId: {
            tripId: trip.id,
            userId: booking.passengerId,
          },
        },
      });

      if (!existingParticipant) {
        await tx.tripParticipant.create({
          data: {
            tripId: trip.id,
            userId: booking.passengerId,
            role: ParticipantRole.PASSENGER,
          },
        });
      }

      this.logger.log(`Booking ${booking.bookingReference} approved. Seats remaining: ${updatedRide.availableSeats}`);
      return updatedBooking;
    });
  }

  /**
   * Reject booking (Driver only).
   */
  private async rejectBooking(booking: any, ride: any, driverId: string, reason?: string): Promise<Booking> {
    if (ride.driverId !== driverId) {
      throw new ForbiddenException('Only the driver can reject booking requests');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Can only reject pending bookings');
    }

    return this.bookingsRepository.update(booking.id, {
      status: BookingStatus.REJECTED,
      cancelReason: reason || 'Rejected by driver',
    });
  }

  /**
   * Cancel booking (Passenger or Driver) - Handles seat refunds.
   */
  private async cancelBooking(booking: any, ride: any, userId: string, reason?: string): Promise<Booking> {
    // 1. Verify access: must be passenger or driver
    if (booking.passengerId !== userId && ride.driverId !== userId) {
      throw new ForbiddenException('You cannot cancel this booking');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    // Run within a transaction to guarantee atomic seat refunds
    return this.prisma.$transaction(async (tx) => {
      // If booking was CONFIRMED, refund the seats back to the ride
      if (booking.status === BookingStatus.CONFIRMED) {
        const currentRide = await tx.ride.findUnique({
          where: { id: ride.id },
        });

        if (currentRide) {
          await tx.ride.update({
            where: { id: ride.id },
            data: {
              availableSeats: currentRide.availableSeats + booking.seatsBooked,
              // If the ride was full, restore status to OPEN
              status: currentRide.status === 'FULL' ? 'OPEN' : currentRide.status,
            },
          });
        }

        // Remove passenger from Trip participants
        const trip = await tx.trip.findUnique({
          where: { rideId: ride.id },
        });

        if (trip) {
          await tx.tripParticipant.deleteMany({
            where: {
              tripId: trip.id,
              userId: booking.passengerId,
              role: ParticipantRole.PASSENGER,
            },
          });
        }
      }

      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CANCELLED,
          cancelReason: reason || 'Cancelled by user',
        },
      });

      this.logger.log(`Booking ${booking.bookingReference} cancelled by ${userId}`);
      return updatedBooking;
    });
  }

  /**
   * Mark booking as NO_SHOW or EXPIRED - Refunds seats.
   */
  private async markNoShowOrExpired(booking: any, ride: any, driverId: string, targetStatus: BookingStatus): Promise<Booking> {
    if (ride.driverId !== driverId) {
      throw new ForbiddenException('Only the driver can update passenger check-in statuses');
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Can only update status of confirmed bookings');
    }

    return this.prisma.$transaction(async (tx) => {
      // Refund seats
      const currentRide = await tx.ride.findUnique({
        where: { id: ride.id },
      });

      if (currentRide) {
        await tx.ride.update({
          where: { id: ride.id },
          data: {
            availableSeats: currentRide.availableSeats + booking.seatsBooked,
            status: currentRide.status === 'FULL' ? 'OPEN' : currentRide.status,
          },
        });
      }

      return tx.booking.update({
        where: { id: booking.id },
        data: { status: targetStatus },
      });
    });
  }
}
