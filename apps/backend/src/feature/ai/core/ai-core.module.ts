import { Module } from '@nestjs/common';
import { OllamaModule } from '~feature/receipt/core/ollama.module';
import { ExpenseCategoryCoreModule } from '~feature/expense-category/core/expense-category-core.module';
import { StoreItemCategoryCoreModule } from '~feature/store-item-category/core/store-item-category-core.module';
import { IncomeCategoryCoreModule } from '~feature/income-category/core/income-category-core.module';
import { AiCategoryService } from './application/services/ai-category.service';

@Module({
  imports: [
    OllamaModule,
    ExpenseCategoryCoreModule,
    StoreItemCategoryCoreModule,
    IncomeCategoryCoreModule,
  ],
  providers: [AiCategoryService],
  exports: [AiCategoryService],
})
export class AiCoreModule {}
