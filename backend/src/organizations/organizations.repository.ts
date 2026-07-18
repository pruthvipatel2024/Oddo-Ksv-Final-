import { Injectable } from '@nestjs/common';
import { Organization } from '@prisma/client';
import { BaseRepository } from '../database/base.repository';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class OrganizationsRepository extends BaseRepository<Organization> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.organization);
  }

  /**
   * Find an organization by its unique signup invite code.
   */
  async findByCode(code: string): Promise<Organization | null> {
    return this.prisma.organization.findUnique({
      where: { code },
    });
  }
}
