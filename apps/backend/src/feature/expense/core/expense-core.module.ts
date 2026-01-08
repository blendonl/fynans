import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { TransactionCoreModule } from '../../transaction/core/transaction-core.module';
import { StoreCoreModule } from '../../store/core/store-core.module';
import { ExpenseCategoryCoreModule } from '../../expense-category/core/expense-category-core.module';
import { ExpenseItemCoreModule } from '../../expense-item/core/expense-item-core.module';
import { FamilyCoreModule } from '../../family/core/family-core.module';
import { NotificationCoreModule } from '../../notification/core/notification-core.module';
import { UserCoreModule } from '../../user/core/user-core.module';
import { PrismaExpenseRepository } from './infrastructure/repositories/prisma-expense.repository';
import { CreateExpenseUseCase } from './application/use-cases/create-expense.use-case';
import { GetExpenseByIdUseCase } from './application/use-cases/get-expense-by-id.use-case';
import { ListExpensesUseCase } from './application/use-cases/list-expenses.use-case';
import { UpdateExpenseUseCase } from './application/use-cases/update-expense.use-case';
import { DeleteExpenseUseCase } from './application/use-cases/delete-expense.use-case';
import { GetExpenseStatisticsUseCase } from './application/use-cases/get-expense-statistics.use-case';
import { AddItemToExpenseUseCase } from './application/use-cases/add-item-to-expense.use-case';
import { ExpenseService } from './application/services/expense.service';

@Module({
  imports: [
    PrismaModule,
    TransactionCoreModule,
    StoreCoreModule,
    ExpenseCategoryCoreModule,
    ExpenseItemCoreModule,
    FamilyCoreModule,
    forwardRef(() => NotificationCoreModule),
    UserCoreModule,
  ],
  providers: [
    {
      provide: 'ExpenseRepository',
      useClass: PrismaExpenseRepository,
    },
    CreateExpenseUseCase,
    GetExpenseByIdUseCase,
    ListExpensesUseCase,
    UpdateExpenseUseCase,
    DeleteExpenseUseCase,
    GetExpenseStatisticsUseCase,
    AddItemToExpenseUseCase,
    ExpenseService,
  ],
  exports: [ExpenseService],
})
export class ExpenseCoreModule {}
