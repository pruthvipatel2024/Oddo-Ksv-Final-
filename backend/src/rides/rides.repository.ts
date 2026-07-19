import { Injectable } from '@nestjs/common';
import { Ride, RideStatus } from '@prisma/client';
import { BaseRepository } from '../database/base.repository';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class RidesRepository extends BaseRepository<Ride> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.ride);
  }

  /**
   * Find global rides matching travel date, organization, and status.
   */
  async findMatchingRides(
    organizationId: string,
    date: Date,
    status: RideStatus = RideStatus.OPEN,
  ): Promise<any[]> {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    return this.prisma.ride.findMany({
      where: {
        organizationId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status,
      },
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            organization: {
              select: {
                name: true,
              },
            },
          },
        },
        vehicle: true,
      },
    });
  }

  /**
   * Find a specific ride with detail properties.
   */
  async findDetailById(id: string): Promise<any> {
    return this.prisma.ride.findUnique({
      where: { id },
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            organization: {
              select: {
                name: true,
              },
            },
          },
        },
        vehicle: true,
        bookings: {
          include: {
            passenger: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Find all rides published by a specific driver, including vehicle and passenger bookings.
   */
  async findByDriverId(driverId: string): Promise<any[]> {
    return this.prisma.ride.findMany({
      where: {
        driverId,
      },
      include: {
        vehicle: true,
        bookings: {
          include: {
            passenger: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }
}
