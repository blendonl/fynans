import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { IncomeCategoryCoreModule } from '../../income-category/core/income-category-core.module';
import { FamilyCoreModule } from '../../family/core/family-core.module';
import { TransactionCoreModule } from '../../transaction/core/transaction-core.module';
import { NotificationCoreModule } from '../../notification/core/notification-core.module';
import { UserCoreModule } from '../../user/core/user-core.module';
import { PrismaIncomeRepository } from './infrastructure/repositories/prisma-income.repository';
import { CreateIncomeUseCase } from './application/use-cases/create-income.use-case';
import { GetIncomeByIdUseCase } from './application/use-cases/get-income-by-id.use-case';
import { GetIncomeByTransactionIdUseCase } from './application/use-cases/get-income-by-transaction-id.use-case';
import { ListIncomesUseCase } from './application/use-cases/list-incomes.use-case';
import { UpdateIncomeUseCase } from './application/use-cases/update-income.use-case';
import { DeleteIncomeUseCase } from './application/use-cases/delete-income.use-case';
import { IncomeService } from './application/services/income.service';

@Module({
  imports: [
    PrismaModule,
    IncomeCategoryCoreModule,
    FamilyCoreModule,
    TransactionCoreModule,
    forwardRef(() => NotificationCoreModule),
    UserCoreModule,
  ],
  providers: [
    {
      provide: 'IncomeRepository',
      useClass: PrismaIncomeRepository,
    },
    CreateIncomeUseCase,
    GetIncomeByIdUseCase,
    GetIncomeByTransactionIdUseCase,
    ListIncomesUseCase,
    UpdateIncomeUseCase,
    DeleteIncomeUseCase,
    IncomeService,
  ],
  exports: [IncomeService, 'IncomeRepository'],
})
export class IncomeCoreModule {}
