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
   * Find rides matching organization, date, and status bounds.
   */
  async findMatchingRides(
    organizationId: string,
    date: Date,
    status: RideStatus = RideStatus.OPEN,
  ): Promise<Ride[]> {
    return this.prisma.ride.findMany({
      where: {
        organizationId,
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
          },
        },
        vehicle: true,
      },
    });
  }

  /**
   * Find a specific ride with detail properties.
   */
  async findDetailById(id: string, organizationId?: string): Promise<any> {
    const where = this.applyTenantFilter({ id }, organizationId);
    return this.prisma.ride.findFirst({
      where,
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
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
