import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Wallet, TransactionType } from '@prisma/client';
import { WalletsRepository } from './wallets.repository';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class WalletsService {
  private readonly logger = new Logger('WalletsService');

  constructor(
    private readonly walletsRepository: WalletsRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get user wallet details by userId.
   */
  async findByUserId(userId: string): Promise<Wallet> {
    const wallet = await this.walletsRepository.findByUserId(userId);
    if (!wallet) {
      // Lazy create wallet if missing
      return this.prisma.$transaction(async (tx) => {
        return tx.wallet.create({
          data: {
            userId,
            availableBalance: 0.0,
            pendingEarnings: 0.0,
          },
        });
      });
    }
    return wallet;
  }

  /**
   * Recharge available balance (Deposit).
   */
  async recharge(userId: string, amount: number, referenceId?: string): Promise<Wallet> {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: Number(wallet.availableBalance) + amount,
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId: wallet.userId,
          amount,
          type: TransactionType.DEPOSIT,
          description: 'Wallet deposit recharge',
          relatedPaymentId: referenceId || null,
        },
      });

      this.logger.log(`Wallet ${wallet.id} deposited: ${amount}. Available: ${updated.availableBalance}`);
      return updated;
    });
  }

  /**
   * Debit money from availableBalance. Enforces balance guards.
   */
  async debit(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string,
    dbTx?: any,
  ): Promise<Wallet> {
    const runUpdate = async (tx: any) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      const balance = Number(wallet.availableBalance);
      if (balance - amount < 0) {
        throw new BadRequestException('Insufficient wallet balance to perform deduction');
      }

      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: balance - amount,
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId,
          amount,
          type: TransactionType.DEBIT,
          description,
          relatedPaymentId: referenceId || null,
        },
      });

      return updated;
    };

    return dbTx ? runUpdate(dbTx) : this.prisma.$transaction(runUpdate);
  }

  /**
   * Credit money to availableBalance.
   */
  async credit(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string,
    dbTx?: any,
  ): Promise<Wallet> {
    const runUpdate = async (tx: any) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: Number(wallet.availableBalance) + amount,
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId,
          amount,
          type: TransactionType.CREDIT,
          description,
          relatedPaymentId: referenceId || null,
        },
      });

      return updated;
    };

    return dbTx ? runUpdate(dbTx) : this.prisma.$transaction(runUpdate);
  }

  /**
   * Move pending earnings to available balance.
   */
  async releaseEarnings(
    userId: string,
    grossAmount: number,
    netAmount: number,
    description: string,
    referenceId?: string,
    dbTx?: any,
  ): Promise<Wallet> {
    const runUpdate = async (tx: any) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      const pending = Number(wallet.pendingEarnings);
      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          pendingEarnings: pending - grossAmount >= 0 ? pending - grossAmount : 0,
          availableBalance: Number(wallet.availableBalance) + netAmount,
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId,
          amount: netAmount,
          type: TransactionType.CREDIT,
          description,
          relatedPaymentId: referenceId || null,
        },
      });

      return updated;
    };

    return dbTx ? runUpdate(dbTx) : this.prisma.$transaction(runUpdate);
  }

  /**
   * Add to pending earnings.
   */
  async addPendingEarnings(
    userId: string,
    amount: number,
    dbTx?: any,
  ): Promise<Wallet> {
    const runUpdate = async (tx: any) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      return tx.wallet.update({
        where: { id: wallet.id },
        data: {
          pendingEarnings: Number(wallet.pendingEarnings) + amount,
        },
      });
    };

    return dbTx ? runUpdate(dbTx) : this.prisma.$transaction(runUpdate);
  }
}
