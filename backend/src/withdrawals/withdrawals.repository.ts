import { Injectable } from '@nestjs/common';
import { WithdrawalRequest } from '@prisma/client';
import { BaseRepository } from '../database/base.repository';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class WithdrawalsRepository extends BaseRepository<WithdrawalRequest> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.withdrawalRequest);
  }

  /**
   * List all withdrawal requests submitted by a specific user.
   */
  async findByUserId(userId: string): Promise<WithdrawalRequest[]> {
    return this.prisma.withdrawalRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
