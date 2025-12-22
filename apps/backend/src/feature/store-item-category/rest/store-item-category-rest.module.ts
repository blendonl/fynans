import { Module } from '@nestjs/common';
import { StoreItemCategoryCoreModule } from '../core/store-item-category-core.module';
import { StoreItemCategoryController } from './controllers/store-item-category.controller';

@Module({
  imports: [StoreItemCategoryCoreModule],
  controllers: [StoreItemCategoryController],
})
export class StoreItemCategoryRestModule {}
