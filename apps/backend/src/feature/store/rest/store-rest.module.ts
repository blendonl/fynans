import { Module } from '@nestjs/common';
import { StoreCoreModule } from '../core/store-core.module';
import { StoreController } from './controllers/store.controller';
import { StoreItemController } from './controllers/store-item.controller';
import { NestedStoreItemController } from './controllers/nested-store-item.controller';

@Module({
  imports: [StoreCoreModule],
  controllers: [StoreController, StoreItemController, NestedStoreItemController],
})
export class StoreRestModule {}
