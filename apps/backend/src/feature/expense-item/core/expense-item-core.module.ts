import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { AuthorizationModule } from '../../../common/authorization/authorization.module';
import { StoreCoreModule } from '../../store/core/store-core.module';
import { StoreItemCategoryCoreModule } from '../../store-item-category/core/store-item-category-core.module';
import { TransactionCoreModule } from '../../transaction/core/transaction-core.module';
import { FamilyCoreModule } from '../../family/core/family-core.module';
import { PaymentMethodCoreModule } from '../../payment-method/core/payment-method-core.module';
import { PrismaExpenseItemRepository } from './infrastructure/repositories/prisma-expense-item.repository';
import { CreateExpenseItemUseCase } from './application/use-cases/create-expense-item.use-case';
import { GetExpenseItemByIdUseCase } from './application/use-cases/get-expense-item-by-id.use-case';
import { ListExpenseItemsUseCase } from './application/use-cases/list-expense-items.use-case';
import { UpdateExpenseItemUseCase } from './application/use-cases/update-expense-item.use-case';
import { DeleteExpenseItemUseCase } from './application/use-cases/delete-expense-item.use-case';
import { CalculateExpenseTotalUseCase } from './application/use-cases/calculate-expense-total.use-case';
import { SyncExpenseTotalUseCase } from './application/use-cases/sync-expense-total.use-case';
import { AddExpenseItemUseCase } from './application/use-cases/add-expense-item.use-case';
import { ExpenseItemService } from './application/services/expense-item.service';

@Module({
  imports: [
    PrismaModule,
    AuthorizationModule,
    StoreCoreModule,
    StoreItemCategoryCoreModule,
    TransactionCoreModule,
    FamilyCoreModule,
    PaymentMethodCoreModule,
  ],
  providers: [
    {
      provide: 'ExpenseItemRepository',
      useClass: PrismaExpenseItemRepository,
    },
    CreateExpenseItemUseCase,
    GetExpenseItemByIdUseCase,
    ListExpenseItemsUseCase,
    UpdateExpenseItemUseCase,
    DeleteExpenseItemUseCase,
    CalculateExpenseTotalUseCase,
    SyncExpenseTotalUseCase,
    AddExpenseItemUseCase,
    ExpenseItemService,
  ],
  exports: [ExpenseItemService, 'ExpenseItemRepository'],
})
export class ExpenseItemCoreModule {}
