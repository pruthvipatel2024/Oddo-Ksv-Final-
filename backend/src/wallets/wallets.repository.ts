import { Injectable } from '@nestjs/common';
import { Wallet } from '@prisma/client';
import { BaseRepository } from '../database/base.repository';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class WalletsRepository extends BaseRepository<Wallet> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.wallet);
  }

  /**
   * Find wallet by userId, including recent transactions.
   */
  async findByUserId(userId: string): Promise<Wallet | null> {
    return this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
  }
}
