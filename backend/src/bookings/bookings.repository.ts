import { Injectable } from '@nestjs/common';
import { Booking, BookingStatus } from '@prisma/client';
import { BaseRepository } from '../database/base.repository';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class BookingsRepository extends BaseRepository<Booking> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.booking);
  }

  /**
   * Find booking with nested details.
   */
  async findDetailById(id: string): Promise<any> {
    return this.prisma.booking.findFirst({
      where: {
        id,
      },
      include: {
        ride: {
          include: {
            driver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        passenger: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  /**
   * Find all bookings for a specific passenger.
   */
  async findByPassengerId(passengerId: string): Promise<Booking[]> {
    return this.prisma.booking.findMany({
      where: { passengerId },
      include: {
        ride: {
          include: {
            driver: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Find all bookings for a specific ride.
   */
  async findByRideId(rideId: string): Promise<Booking[]> {
    return this.prisma.booking.findMany({
      where: { rideId },
      include: {
        passenger: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  /**
   * Check if a user already has an active booking on a specific ride.
   */
  async findUserActiveBookingOnRide(passengerId: string, rideId: string): Promise<Booking | null> {
    return this.prisma.booking.findFirst({
      where: {
        passengerId,
        rideId,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
      },
    });
  }
}
