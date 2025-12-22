import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { StoreCoreModule } from '../../store/core/store-core.module';
import { StoreItemCategoryCoreModule } from '../../store-item-category/core/store-item-category-core.module';
import { PrismaExpenseItemRepository } from './infrastructure/repositories/prisma-expense-item.repository';
import { CreateExpenseItemUseCase } from './application/use-cases/create-expense-item.use-case';
import { GetExpenseItemByIdUseCase } from './application/use-cases/get-expense-item-by-id.use-case';
import { ListExpenseItemsUseCase } from './application/use-cases/list-expense-items.use-case';
import { UpdateExpenseItemUseCase } from './application/use-cases/update-expense-item.use-case';
import { DeleteExpenseItemUseCase } from './application/use-cases/delete-expense-item.use-case';
import { CalculateExpenseTotalUseCase } from './application/use-cases/calculate-expense-total.use-case';
import { ExpenseItemService } from './application/services/expense-item.service';

@Module({
  imports: [PrismaModule, StoreCoreModule, StoreItemCategoryCoreModule],
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
    ExpenseItemService,
  ],
  exports: [ExpenseItemService, 'ExpenseItemRepository'],
})
export class ExpenseItemCoreModule {}
