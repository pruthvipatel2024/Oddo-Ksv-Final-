import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import {
  Booking,
  BookingStatus,
  TripStatus,
  ParticipantRole,
  PaymentStatus,
  PaymentMethod,
} from '@prisma/client';
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
   * Request a new ride booking and debit the passenger's wallet into platform escrow.
   */
  async create(passengerId: string, dto: CreateBookingDto): Promise<Booking> {
    // 1. Verify ride exists globally
    const ride = await this.ridesService.findById(dto.rideId);

    // 2. Prevent driver from booking their own ride
    if (ride.driverId === passengerId) {
      throw new BadRequestException('Drivers cannot book their own rides');
    }

    // 3. Check for active duplicates
    const activeBooking =
      await this.bookingsRepository.findUserActiveBookingOnRide(
        passengerId,
        dto.rideId,
      );
    if (activeBooking) {
      throw new ConflictException(
        'You already have an active booking request for this ride',
      );
    }

    const fare = Number(ride.farePerSeat) * dto.seatsBooked;
    const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    const bookingReference = `BCK-${Date.now().toString().substring(5, 10)}-${randomCode}`;

    // 4. Perform transaction-level escrow balance checks and debits
    return this.prisma.$transaction(async (tx) => {
      // Get passenger's wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId: passengerId },
      });

      if (!wallet || Number(wallet.availableBalance) < fare) {
        throw new BadRequestException(
          'Insufficient wallet balance to book this ride. Please recharge your wallet.',
        );
      }

      // Check current ride seat count
      const currentRide = await tx.ride.findUnique({
        where: { id: dto.rideId },
      });

      if (
        !currentRide ||
        currentRide.status !== 'OPEN' ||
        currentRide.availableSeats < dto.seatsBooked
      ) {
        throw new BadRequestException(
          'The requested ride is not open or does not have enough available seats',
        );
      }

      // Debit passenger wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: Number(wallet.availableBalance) - fare,
        },
      });

      // Log wallet transaction
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId: passengerId,
          amount: fare,
          type: 'DEBIT',
          description: `Fare escrowed for booking: ${bookingReference}`,
        },
      });

      // Create Booking
      const booking = await tx.booking.create({
        data: {
          bookingReference,
          seatsBooked: dto.seatsBooked,
          fare,
          status: BookingStatus.PENDING,
          rideId: dto.rideId,
          passengerId,
        },
      });

      // Create Payment in ESCROWED state
      await tx.payment.create({
        data: {
          tripId: undefined, // Will be linked when the Trip is actually created
          bookingId: booking.id,
          payerId: passengerId,
          amount: fare,
          method: PaymentMethod.WALLET,
          status: PaymentStatus.ESCROWED,
          currency: 'INR',
        },
      });

      this.logger.log(
        `Booking ${bookingReference} requested. Escrowed fare: ${fare} from Passenger: ${passengerId}`,
      );
      return booking;
    });
  }

  /**
   * Get booking details.
   */
  async findById(id: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findDetailById(id);
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
   * Update booking status (Approval, Rejection, Cancellation) with seat and wallet refunds.
   */
  async updateStatus(
    id: string,
    userId: string,
    dto: UpdateBookingStatusDto,
  ): Promise<Booking> {
    const booking = await this.bookingsRepository.findDetailById(id);
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
   * Approve booking (Driver only) - Decrements seats, provisions Trip, and links payments.
   */
  private async approveBooking(
    booking: any,
    ride: any,
    driverId: string,
  ): Promise<Booking> {
    if (ride.driverId !== driverId) {
      throw new ForbiddenException(
        'Only the driver can approve booking requests',
      );
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Can only approve pending bookings');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch ride details to check available seats (locks the record)
      const currentRide = await tx.ride.findUnique({
        where: { id: ride.id },
      });

      if (!currentRide) {
        throw new NotFoundException('Associated ride not found');
      }

      if (currentRide.availableSeats < booking.seatsBooked) {
        throw new BadRequestException(
          'Not enough seats available on this ride',
        );
      }

      // 2. Decrement available seats
      const updatedRide = await tx.ride.update({
        where: { id: ride.id },
        data: {
          availableSeats: currentRide.availableSeats - booking.seatsBooked,
        },
      });

      if (updatedRide.availableSeats === 0) {
        await tx.ride.update({
          where: { id: ride.id },
          data: { status: 'FULL' },
        });
      }

      // 3. Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CONFIRMED,
          approvedBy: driverId,
        },
      });

      // 4. Retrieve or provision Trip record (1:1 with confirmed Ride)
      let trip = await tx.trip.findUnique({
        where: { rideId: ride.id },
      });

      if (!trip) {
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

      // Link payment escrow to the newly created Trip
      await tx.payment.updateMany({
        where: { bookingId: booking.id },
        data: { tripId: trip.id },
      });

      // Add Passenger to Trip Participants
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

      this.logger.log(
        `Booking ${booking.bookingReference} approved. Trip ID: ${trip.id}`,
      );
      return updatedBooking;
    });
  }

  /**
   * Reject booking (Driver only) - Refunds passenger.
   */
  private async rejectBooking(
    booking: any,
    ride: any,
    driverId: string,
    reason?: string,
  ): Promise<Booking> {
    if (ride.driverId !== driverId) {
      throw new ForbiddenException(
        'Only the driver can reject booking requests',
      );
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Can only reject pending bookings');
    }

    return this.prisma.$transaction(async (tx) => {
      // Refund escrow payment back to the passenger's wallet
      const payment = await tx.payment.findFirst({
        where: { bookingId: booking.id, status: PaymentStatus.ESCROWED },
      });

      if (payment) {
        const wallet = await tx.wallet.findUnique({
          where: { userId: booking.passengerId },
        });
        if (wallet) {
          await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              availableBalance:
                Number(wallet.availableBalance) + Number(payment.amount),
            },
          });

          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              userId: booking.passengerId,
              amount: payment.amount,
              type: 'REFUND',
              description: `Refund for rejected booking #${booking.bookingReference}`,
            },
          });
        }

        await tx.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.REFUNDED },
        });
      }

      return tx.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.REJECTED,
          cancelReason: reason || 'Rejected by driver',
        },
      });
    });
  }

  /**
   * Cancel booking (Passenger or Driver) - Refunds seats and passenger wallet.
   */
  private async cancelBooking(
    booking: any,
    ride: any,
    userId: string,
    reason?: string,
  ): Promise<Booking> {
    if (booking.passengerId !== userId && ride.driverId !== userId) {
      throw new ForbiddenException('You cannot cancel this booking');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Refund seats if booking was already CONFIRMED
      if (booking.status === BookingStatus.CONFIRMED) {
        const currentRide = await tx.ride.findUnique({
          where: { id: ride.id },
        });

        if (currentRide) {
          await tx.ride.update({
            where: { id: ride.id },
            data: {
              availableSeats: currentRide.availableSeats + booking.seatsBooked,
              status:
                currentRide.status === 'FULL' ? 'OPEN' : currentRide.status,
            },
          });
        }

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

      // 2. Refund escrowed payment
      const payment = await tx.payment.findFirst({
        where: { bookingId: booking.id, status: PaymentStatus.ESCROWED },
      });

      if (payment) {
        const wallet = await tx.wallet.findUnique({
          where: { userId: booking.passengerId },
        });
        if (wallet) {
          await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              availableBalance:
                Number(wallet.availableBalance) + Number(payment.amount),
            },
          });

          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              userId: booking.passengerId,
              amount: payment.amount,
              type: 'REFUND',
              description: `Refund for cancelled booking #${booking.bookingReference}`,
            },
          });
        }

        await tx.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.REFUNDED },
        });
      }

      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CANCELLED,
          cancelReason: reason || 'Cancelled by user',
        },
      });

      this.logger.log(
        `Booking ${booking.bookingReference} cancelled. Refund issued.`,
      );
      return updatedBooking;
    });
  }

  /**
   * Mark booking as NO_SHOW or EXPIRED - Refunds seats and passenger.
   */
  private async markNoShowOrExpired(
    booking: any,
    ride: any,
    driverId: string,
    targetStatus: BookingStatus,
  ): Promise<Booking> {
    if (ride.driverId !== driverId) {
      throw new ForbiddenException(
        'Only the driver can update passenger check-in statuses',
      );
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException(
        'Can only update status of confirmed bookings',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Refund seats back to the ride
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

      // Refund escrowed payment
      const payment = await tx.payment.findFirst({
        where: { bookingId: booking.id, status: PaymentStatus.ESCROWED },
      });

      if (payment) {
        const wallet = await tx.wallet.findUnique({
          where: { userId: booking.passengerId },
        });
        if (wallet) {
          await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              availableBalance:
                Number(wallet.availableBalance) + Number(payment.amount),
            },
          });

          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              userId: booking.passengerId,
              amount: payment.amount,
              type: 'REFUND',
              description: `Refund for booking #${booking.bookingReference} (${targetStatus})`,
            },
          });
        }

        await tx.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.REFUNDED },
        });
      }

      return tx.booking.update({
        where: { id: booking.id },
        data: { status: targetStatus },
      });
    });
  }
}
