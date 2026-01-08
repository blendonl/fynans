import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { FamilyCoreModule } from '../../family/core/family-core.module';

import { TransactionService } from './application/services/transaction.service';

import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case';
import { GetTransactionByIdUseCase } from './application/use-cases/get-transaction-by-id.use-case';
import { ListTransactionsUseCase } from './application/use-cases/list-transactions.use-case';
import { UpdateTransactionUseCase } from './application/use-cases/update-transaction.use-case';
import { DeleteTransactionUseCase } from './application/use-cases/delete-transaction.use-case';
import { GetTransactionStatisticsUseCase } from './application/use-cases/get-transaction-statistics.use-case';

import { PrismaTransactionRepository } from './infrastructure/repositories/prisma-transaction.repository';

@Module({
  imports: [
    PrismaModule,
    FamilyCoreModule,
  ],
  providers: [
    {
      provide: 'TransactionRepository',
      useClass: PrismaTransactionRepository,
    },
    CreateTransactionUseCase,
    GetTransactionByIdUseCase,
    ListTransactionsUseCase,
    UpdateTransactionUseCase,
    DeleteTransactionUseCase,
    GetTransactionStatisticsUseCase,
    TransactionService,
  ],
  exports: [TransactionService],
})
export class TransactionCoreModule {}
