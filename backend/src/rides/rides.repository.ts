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
   * Find global rides matching travel date and status.
   */
  async findMatchingRides(
    date: Date,
    status: RideStatus = RideStatus.OPEN,
  ): Promise<any[]> {
    return this.prisma.ride.findMany({
      where: {
        date,
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
}
