import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { WithdrawalRequest, WithdrawalStatus, TransactionType } from '@prisma/client';
import { WithdrawalsRepository } from './withdrawals.repository';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { UpdateWithdrawalDto } from './dto/update-withdrawal.dto';
import { WalletsService } from '../wallets/wallets.service';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class WithdrawalsService {
  private readonly logger = new Logger('WithdrawalsService');

  constructor(
    private readonly withdrawalsRepository: WithdrawalsRepository,
    private readonly walletsService: WalletsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Create a withdrawal request and debit the driver's available wallet balance.
   */
  async create(userId: string, dto: CreateWithdrawalDto): Promise<WithdrawalRequest> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch wallet
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      // 2. Validate balance
      const balance = Number(wallet.availableBalance);
      if (balance < dto.amount) {
        throw new BadRequestException('Insufficient wallet balance for withdrawal');
      }

      // 3. Deduct from available balance
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { availableBalance: balance - dto.amount },
      });

      // 4. Create withdrawal request record
      const request = await tx.withdrawalRequest.create({
        data: {
          userId,
          amount: dto.amount,
          bankAccountDetails: dto.bankAccountDetails,
          status: WithdrawalStatus.PENDING,
        },
      });

      // 5. Create ledger transaction entry
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId,
          amount: dto.amount,
          type: TransactionType.WITHDRAWAL,
          description: `Withdrawal request submitted: #${request.id}`,
        },
      });

      this.logger.log(`User ${userId} requested withdrawal of ${dto.amount}. Wallet debited.`);
      return request;
    });
  }

  /**
   * Process withdrawal request (Approve, Complete, or Reject with refund).
   */
  async updateStatus(id: string, dto: UpdateWithdrawalDto): Promise<WithdrawalRequest> {
    const request = await this.withdrawalsRepository.findById(id);
    
    if (request.status === WithdrawalStatus.COMPLETED || request.status === WithdrawalStatus.REJECTED) {
      throw new BadRequestException('Withdrawal request is already in a terminal state');
    }

    return this.prisma.$transaction(async (tx) => {
      // If rejecting, refund the money back to the user's wallet
      if (dto.status === WithdrawalStatus.REJECTED) {
        const wallet = await tx.wallet.findUnique({ where: { userId: request.userId } });
        if (wallet) {
          await tx.wallet.update({
            where: { id: wallet.id },
            data: { availableBalance: Number(wallet.availableBalance) + Number(request.amount) },
          });

          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              userId: request.userId,
              amount: request.amount,
              type: TransactionType.REFUND,
              description: `Refund for rejected withdrawal request #${request.id}`,
            },
          });
        }
      }

      const updated = await tx.withdrawalRequest.update({
        where: { id },
        data: {
          status: dto.status,
          transactionReference: dto.transactionReference || request.transactionReference,
        },
      });

      this.logger.log(`Withdrawal request #${id} updated to status: ${dto.status}`);
      return updated;
    });
  }

  /**
   * Find withdrawals by user.
   */
  async findByUser(userId: string): Promise<WithdrawalRequest[]> {
    return this.withdrawalsRepository.findByUserId(userId);
  }

  /**
   * List all withdrawal requests (Super Admin view).
   */
  async findAll(): Promise<WithdrawalRequest[]> {
    return this.withdrawalsRepository.findAll();
  }
}
