import { Injectable } from '@nestjs/common';
import { Vehicle } from '@prisma/client';
import { BaseRepository } from '../database/base.repository';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class VehiclesRepository extends BaseRepository<Vehicle> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.vehicle);
  }

  /**
   * Find all active vehicles owned by a specific user.
   */
  async findByOwnerId(ownerId: string): Promise<Vehicle[]> {
    return this.prisma.vehicle.findMany({
      where: {
        ownerId,
        deletedAt: null,
      },
    });
  }

  /**
   * Find a vehicle by registration number.
   */
  async findByRegistrationNumber(registrationNumber: string): Promise<Vehicle | null> {
    return this.prisma.vehicle.findUnique({
      where: { registrationNumber },
    });
  }
}
