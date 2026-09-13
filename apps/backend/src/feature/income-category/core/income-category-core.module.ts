import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { AuthorizationModule } from '~common/authorization';
import { PrismaIncomeCategoryRepository } from './infrastructure/repositories/prisma-income-category.repository';
import { CreateIncomeCategoryUseCase } from './application/use-cases/create-income-category.use-case';
import { GetIncomeCategoryByIdUseCase } from './application/use-cases/get-income-category-by-id.use-case';
import { ListIncomeCategoriesUseCase } from './application/use-cases/list-income-categories.use-case';
import { GetIncomeCategoryTreeUseCase } from './application/use-cases/get-income-category-tree.use-case';
import { UpdateIncomeCategoryUseCase } from './application/use-cases/update-income-category.use-case';
import { DeleteIncomeCategoryUseCase } from './application/use-cases/delete-income-category.use-case';
import { IncomeCategoryService } from './application/services/income-category.service';

@Module({
  imports: [PrismaModule, AuthorizationModule],
  providers: [
    {
      provide: 'IncomeCategoryRepository',
      useClass: PrismaIncomeCategoryRepository,
    },
    CreateIncomeCategoryUseCase,
    GetIncomeCategoryByIdUseCase,
    ListIncomeCategoriesUseCase,
    GetIncomeCategoryTreeUseCase,
    UpdateIncomeCategoryUseCase,
    DeleteIncomeCategoryUseCase,
    IncomeCategoryService,
  ],
  exports: [IncomeCategoryService, 'IncomeCategoryRepository'],
})
export class IncomeCategoryCoreModule {}
