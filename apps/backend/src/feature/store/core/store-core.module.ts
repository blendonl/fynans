import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { ItemCoreModule } from '../../item/core/item-core.module';
import { StoreItemCategoryCoreModule } from '../../store-item-category/core/store-item-category-core.module';
import { PrismaStoreRepository } from './infrastructure/repositories/prisma-store.repository';
import { PrismaStoreItemRepository } from './infrastructure/repositories/prisma-store-item.repository';
import { CreateOrFindStoreUseCase } from './application/use-cases/create-or-find-store.use-case';
import { GetStoreByIdUseCase } from './application/use-cases/get-store-by-id.use-case';
import { ListStoresUseCase } from './application/use-cases/list-stores.use-case';
import { CreateOrFindStoreItemUseCase } from './application/use-cases/create-or-find-store-item.use-case';
import { GetStoreItemByIdUseCase } from './application/use-cases/get-store-item-by-id.use-case';
import { ListStoreItemsUseCase } from './application/use-cases/list-store-items.use-case';
import { FindStoreBySimilarityUseCase } from './application/use-cases/find-store-by-similarity.use-case';
import { StoreService } from './application/services/store.service';
import { StoreItemService } from './application/services/store-item.service';

@Module({
  imports: [PrismaModule, ItemCoreModule, StoreItemCategoryCoreModule],
  providers: [
    {
      provide: 'StoreRepository',
      useClass: PrismaStoreRepository,
    },
    {
      provide: 'StoreItemRepository',
      useClass: PrismaStoreItemRepository,
    },
    CreateOrFindStoreUseCase,
    GetStoreByIdUseCase,
    ListStoresUseCase,
    CreateOrFindStoreItemUseCase,
    GetStoreItemByIdUseCase,
    ListStoreItemsUseCase,
    FindStoreBySimilarityUseCase,
    StoreService,
    StoreItemService,
  ],
  exports: [
    StoreService,
    StoreItemService,
    CreateOrFindStoreUseCase,
    FindStoreBySimilarityUseCase,
    'StoreItemRepository',
  ],
})
export class StoreCoreModule { }
