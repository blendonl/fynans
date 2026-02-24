import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { TransactionCoreModule } from '../../transaction/core/transaction-core.module';
import { StoreCoreModule } from '../../store/core/store-core.module';
import { ExpenseCategoryCoreModule } from '../../expense-category/core/expense-category-core.module';
import { ExpenseItemCoreModule } from '../../expense-item/core/expense-item-core.module';
import { FamilyCoreModule } from '../../family/core/family-core.module';
import { NotifyFamilyMembersModule } from '~common/services/notify-family-members.module';
import { NotificationModule } from '../../notification/notification.module';
import { PaymentMethodCoreModule } from '../../payment-method/core/payment-method-core.module';
import { PrismaExpenseRepository } from './infrastructure/repositories/prisma-expense.repository';
import { CreateExpenseUseCase } from './application/use-cases/create-expense.use-case';
import { GetExpenseByIdUseCase } from './application/use-cases/get-expense-by-id.use-case';
import { ListExpensesUseCase } from './application/use-cases/list-expenses.use-case';
import { UpdateExpenseUseCase } from './application/use-cases/update-expense.use-case';
import { DeleteExpenseUseCase } from './application/use-cases/delete-expense.use-case';
import { GetExpenseStatisticsUseCase } from './application/use-cases/get-expense-statistics.use-case';
import { GetExpenseTrendsUseCase } from './application/use-cases/get-expense-trends.use-case';
import { AddItemToExpenseUseCase } from './application/use-cases/add-item-to-expense.use-case';
import { ApprovePendingExpenseUseCase } from './application/use-cases/approve-pending-expense.use-case';
import { RejectPendingExpenseUseCase } from './application/use-cases/reject-pending-expense.use-case';
import { ResubmitRejectedExpenseUseCase } from './application/use-cases/resubmit-rejected-expense.use-case';
import { UpdatePendingExpenseUseCase } from './application/use-cases/update-pending-expense.use-case';
import { ExpenseService } from './application/services/expense.service';
import { ExpenseAuthService } from './application/services/expense-auth.service';

@Module({
  imports: [
    PrismaModule,
    TransactionCoreModule,
    StoreCoreModule,
    ExpenseCategoryCoreModule,
    ExpenseItemCoreModule,
    FamilyCoreModule,
    NotifyFamilyMembersModule,
    forwardRef(() => NotificationModule),
    PaymentMethodCoreModule,
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
    GetExpenseTrendsUseCase,
    AddItemToExpenseUseCase,
    ApprovePendingExpenseUseCase,
    RejectPendingExpenseUseCase,
    ResubmitRejectedExpenseUseCase,
    UpdatePendingExpenseUseCase,
    ExpenseService,
    ExpenseAuthService,
  ],
  exports: [ExpenseService],
})
export class ExpenseCoreModule {}
