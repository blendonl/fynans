import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { AuthorizationModule } from '~common/authorization';
import { PrismaExpenseCategoryRepository } from './infrastructure/repositories/prisma-expense-category.repository';
import { CreateExpenseCategoryUseCase } from './application/use-cases/create-expense-category.use-case';
import { GetExpenseCategoryByIdUseCase } from './application/use-cases/get-expense-category-by-id.use-case';
import { ListExpenseCategoriesUseCase } from './application/use-cases/list-expense-categories.use-case';
import { GetCategoryTreeUseCase } from './application/use-cases/get-category-tree.use-case';
import { UpdateExpenseCategoryUseCase } from './application/use-cases/update-expense-category.use-case';
import { DeleteExpenseCategoryUseCase } from './application/use-cases/delete-expense-category.use-case';
import { ExpenseCategoryService } from './application/services/expense-category.service';

@Module({
  imports: [PrismaModule, AuthorizationModule],
  providers: [
    {
      provide: 'ExpenseCategoryRepository',
      useClass: PrismaExpenseCategoryRepository,
    },
    CreateExpenseCategoryUseCase,
    GetExpenseCategoryByIdUseCase,
    ListExpenseCategoriesUseCase,
    GetCategoryTreeUseCase,
    UpdateExpenseCategoryUseCase,
    DeleteExpenseCategoryUseCase,
    ExpenseCategoryService,
  ],
  exports: [ExpenseCategoryService, 'ExpenseCategoryRepository'],
})
export class ExpenseCategoryCoreModule {}
