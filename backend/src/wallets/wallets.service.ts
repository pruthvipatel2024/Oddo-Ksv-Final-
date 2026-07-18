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
   * Get user wallet details.
   */
  async findByUserId(userId: string): Promise<Wallet> {
    const wallet = await this.walletsRepository.findByUserId(userId);
    if (!wallet) {
      throw new NotFoundException('Wallet profile not found');
    }
    return wallet;
  }

  /**
   * Recharge user wallet balance (Credit).
   */
  async recharge(userId: string, amount: number, referenceId?: string): Promise<Wallet> {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      // 1. Update wallet balance
      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: Number(wallet.balance) + amount,
        },
      });

      // 2. Record ledger transaction
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId: wallet.userId,
          amount,
          type: TransactionType.CREDIT,
          description: 'Wallet recharge deposit',
          relatedPaymentId: referenceId || null,
        },
      });

      this.logger.log(`Wallet ${wallet.id} recharged with ${amount}. New balance: ${updated.balance}`);
      return updated;
    });
  }

  /**
   * Debit money from wallet. Enforces balance guards.
   */
  async debit(
    walletId: string,
    amount: number,
    description: string,
    referenceId?: string,
    dbTx?: any,
  ): Promise<Wallet> {
    const runUpdate = async (tx: any) => {
      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!wallet) {
        throw new NotFoundException('Wallet profile not found');
      }

      const balance = Number(wallet.balance);
      if (balance - amount < 0) {
        throw new BadRequestException('Insufficient wallet balance to perform deduction');
      }

      // Update wallet balance
      const updated = await tx.wallet.update({
        where: { id: walletId },
        data: {
          balance: balance - amount,
        },
      });

      // Write ledger transaction
      await tx.walletTransaction.create({
        data: {
          walletId,
          userId: wallet.userId,
          amount,
          type: TransactionType.DEBIT,
          description,
          relatedPaymentId: referenceId || null,
        },
      });

      return updated;
    };

    if (dbTx) {
      return runUpdate(dbTx);
    } else {
      return this.prisma.$transaction(runUpdate);
    }
  }

  /**
   * Credit money to wallet.
   */
  async credit(
    walletId: string,
    amount: number,
    description: string,
    referenceId?: string,
    dbTx?: any,
  ): Promise<Wallet> {
    const runUpdate = async (tx: any) => {
      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!wallet) {
        throw new NotFoundException('Wallet profile not found');
      }

      const updated = await tx.wallet.update({
        where: { id: walletId },
        data: {
          balance: Number(wallet.balance) + amount,
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId,
          userId: wallet.userId,
          amount,
          type: TransactionType.CREDIT,
          description,
          relatedPaymentId: referenceId || null,
        },
      });

      return updated;
    };

    if (dbTx) {
      return runUpdate(dbTx);
    } else {
      return this.prisma.$transaction(runUpdate);
    }
  }
}
