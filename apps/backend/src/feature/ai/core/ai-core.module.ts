import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ExpenseCategoryCoreModule } from '~feature/expense-category/core/expense-category-core.module';
import { StoreItemCategoryCoreModule } from '~feature/store-item-category/core/store-item-category-core.module';
import { IncomeCategoryCoreModule } from '~feature/income-category/core/income-category-core.module';
import { AiCategoryService } from './application/services/ai-category.service';
import { CopilotCompletionService } from './infrastructure/services/copilot-completion.service';
import { CopilotTokenService } from '~common/services/copilot-token.service';

@Module({
  imports: [
    ConfigModule,
    ExpenseCategoryCoreModule,
    StoreItemCategoryCoreModule,
    IncomeCategoryCoreModule,
  ],
  providers: [
    CopilotTokenService,
    {
      provide: 'LlmService',
      useClass: CopilotCompletionService,
    },
    AiCategoryService,
  ],
  exports: [AiCategoryService],
})
export class AiCoreModule {}
