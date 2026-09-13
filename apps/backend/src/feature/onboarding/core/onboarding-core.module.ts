import { Module } from '@nestjs/common';
import { ExpenseCategoryCoreModule } from '~feature/expense-category/core/expense-category-core.module';
import { IncomeCategoryCoreModule } from '~feature/income-category/core/income-category-core.module';
import { StoreItemCategoryCoreModule } from '~feature/store-item-category/core/store-item-category-core.module';
import { PaymentMethodCoreModule } from '~feature/payment-method/core/payment-method-core.module';
import { SeedUserCatalogUseCase } from './application/use-cases/seed-user-catalog.use-case';
import { GetOnboardingStatusUseCase } from './application/use-cases/get-onboarding-status.use-case';
import { OnboardingService } from './application/services/onboarding.service';

@Module({
  imports: [
    ExpenseCategoryCoreModule,
    IncomeCategoryCoreModule,
    StoreItemCategoryCoreModule,
    PaymentMethodCoreModule,
  ],
  providers: [
    SeedUserCatalogUseCase,
    GetOnboardingStatusUseCase,
    OnboardingService,
  ],
  exports: [OnboardingService],
})
export class OnboardingCoreModule {}
