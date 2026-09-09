import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { FamilyCoreModule } from '../../family/core/family-core.module';
import { PaymentMethodCoreModule } from '../../payment-method/core/payment-method-core.module';

import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case';
import { GetTransactionByIdUseCase } from './application/use-cases/get-transaction-by-id.use-case';
import { ListTransactionsUseCase } from './application/use-cases/list-transactions.use-case';
import { UpdateTransactionUseCase } from './application/use-cases/update-transaction.use-case';
import { DeleteTransactionUseCase } from './application/use-cases/delete-transaction.use-case';
import { GetTransactionStatisticsUseCase } from './application/use-cases/get-transaction-statistics.use-case';
import { GetTransactionStatisticsComparisonUseCase } from './application/use-cases/get-transaction-statistics-comparison.use-case';
import { ExportTransactionsUseCase } from './application/use-cases/export-transactions.use-case';

import { PrismaTransactionRepository } from './infrastructure/repositories/prisma-transaction.repository';
import { PrismaTransactionDetailRepository } from './infrastructure/repositories/prisma-transaction-detail.repository';
import { TRANSACTION_DETAIL_REPOSITORY } from './domain/repositories/transaction-detail.repository.interface';

@Module({
  imports: [PrismaModule, FamilyCoreModule, PaymentMethodCoreModule],
  providers: [
    {
      provide: 'TransactionRepository',
      useClass: PrismaTransactionRepository,
    },
    {
      provide: TRANSACTION_DETAIL_REPOSITORY,
      useClass: PrismaTransactionDetailRepository,
    },
    CreateTransactionUseCase,
    GetTransactionByIdUseCase,
    ListTransactionsUseCase,
    UpdateTransactionUseCase,
    DeleteTransactionUseCase,
    GetTransactionStatisticsUseCase,
    GetTransactionStatisticsComparisonUseCase,
    ExportTransactionsUseCase,
  ],
  exports: [
    CreateTransactionUseCase,
    GetTransactionByIdUseCase,
    ListTransactionsUseCase,
    UpdateTransactionUseCase,
    DeleteTransactionUseCase,
    GetTransactionStatisticsUseCase,
    GetTransactionStatisticsComparisonUseCase,
    ExportTransactionsUseCase,
    'TransactionRepository',
  ],
})
export class TransactionCoreModule {}
