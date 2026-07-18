import { Injectable } from '@nestjs/common';
import { Trip, TripStatus } from '@prisma/client';
import { BaseRepository } from '../database/base.repository';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TripsRepository extends BaseRepository<Trip> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.trip);
  }

  /**
   * Find trip details including participants and ride info.
   */
  async findDetailById(id: string, organizationId?: string): Promise<any> {
    return this.prisma.trip.findFirst({
      where: {
        id,
        ride: organizationId ? { organizationId } : undefined,
      },
      include: {
        ride: {
          include: {
            driver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            vehicle: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
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
   * Find trips that a specific user participates in.
   */
  async findByParticipantId(userId: string): Promise<Trip[]> {
    return this.prisma.trip.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
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
}
