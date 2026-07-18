import { Injectable } from '@nestjs/common';
import { Wallet, WalletTransaction } from '@prisma/client';
import { BaseRepository } from '../database/base.repository';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class WalletsRepository extends BaseRepository<Wallet> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.wallet);
  }

  /**
   * Find a wallet belonging to a specific user.
   */
  async findByUserId(userId: string): Promise<Wallet | null> {
    return this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  /**
   * Find wallet by ID with write lock (useful inside transactions).
   */
  async findByIdForUpdate(id: string, tx: any): Promise<Wallet | null> {
    return tx.wallet.findUnique({
      where: { id },
    });
  }
}
