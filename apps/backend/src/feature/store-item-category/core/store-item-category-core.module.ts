import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { PrismaStoreItemCategoryRepository } from './infrastructure/repositories/prisma-store-item-category.repository';
import { CreateStoreItemCategoryUseCase } from './application/use-cases/create-store-item-category.use-case';
import { GetStoreItemCategoryByIdUseCase } from './application/use-cases/get-store-item-category-by-id.use-case';
import { ListStoreItemCategoriesUseCase } from './application/use-cases/list-store-item-categories.use-case';
import { GetItemCategoryTreeUseCase } from './application/use-cases/get-item-category-tree.use-case';
import { UpdateStoreItemCategoryUseCase } from './application/use-cases/update-store-item-category.use-case';
import { DeleteStoreItemCategoryUseCase } from './application/use-cases/delete-store-item-category.use-case';
import { StoreItemCategoryService } from './application/services/store-item-category.service';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: 'StoreItemCategoryRepository',
      useClass: PrismaStoreItemCategoryRepository,
    },
    CreateStoreItemCategoryUseCase,
    GetStoreItemCategoryByIdUseCase,
    ListStoreItemCategoriesUseCase,
    GetItemCategoryTreeUseCase,
    UpdateStoreItemCategoryUseCase,
    DeleteStoreItemCategoryUseCase,
    StoreItemCategoryService,
  ],
  exports: [StoreItemCategoryService, 'StoreItemCategoryRepository'],
})
export class StoreItemCategoryCoreModule {}
