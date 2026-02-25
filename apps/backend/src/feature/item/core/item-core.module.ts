import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { StoreItemCategoryCoreModule } from '../../store-item-category/core/store-item-category-core.module';
import { PrismaItemRepository } from './infrastructure/repositories/prisma-item.repository';
import { PrismaItemSizeRepository } from './infrastructure/repositories/prisma-item-size.repository';
import { CreateItemUseCase } from './application/use-cases/create-item.use-case';
import { GetItemByIdUseCase } from './application/use-cases/get-item-by-id.use-case';
import { GetItemByIdWithDetailUseCase } from './application/use-cases/get-item-by-id-with-detail.use-case';
import { ListItemsUseCase } from './application/use-cases/list-items.use-case';
import { FindItemByNameUseCase } from './application/use-cases/find-item-by-name.use-case';
import { UpdateItemUseCase } from './application/use-cases/update-item.use-case';
import { DeleteItemUseCase } from './application/use-cases/delete-item.use-case';
import { SearchItemsWithStoresUseCase } from './application/use-cases/search-items-with-stores.use-case';
import { ItemService } from './application/services/item.service';

@Module({
  imports: [PrismaModule, StoreItemCategoryCoreModule],
  providers: [
    {
      provide: 'ItemRepository',
      useClass: PrismaItemRepository,
    },
    {
      provide: 'ItemSizeRepository',
      useClass: PrismaItemSizeRepository,
    },
    CreateItemUseCase,
    GetItemByIdUseCase,
    GetItemByIdWithDetailUseCase,
    ListItemsUseCase,
    FindItemByNameUseCase,
    UpdateItemUseCase,
    DeleteItemUseCase,
    SearchItemsWithStoresUseCase,
    ItemService,
  ],
  exports: [ItemService, 'ItemRepository', 'ItemSizeRepository'],
})
export class ItemCoreModule {}
