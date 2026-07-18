import { Module } from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { WithdrawalsController } from './withdrawals.controller';
import { WithdrawalsRepository } from './withdrawals.repository';
import { WalletsModule } from '../wallets/wallets.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [WalletsModule, DatabaseModule],
  controllers: [WithdrawalsController],
  providers: [WithdrawalsService, WithdrawalsRepository],
  exports: [WithdrawalsService],
})
export class WithdrawalsModule {}
