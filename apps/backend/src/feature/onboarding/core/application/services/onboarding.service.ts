import { Injectable, Logger } from '@nestjs/common';
import {
  SeedUserCatalogUseCase,
  CatalogSeedResult,
} from '../use-cases/seed-user-catalog.use-case';
import {
  GetOnboardingStatusUseCase,
  OnboardingStatus,
} from '../use-cases/get-onboarding-status.use-case';

const NOTHING_SEEDED: CatalogSeedResult = {
  expenseCategoriesCreated: 0,
  incomeCategoriesCreated: 0,
  itemCategoriesCreated: 0,
};

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly seedUserCatalogUseCase: SeedUserCatalogUseCase,
    private readonly getOnboardingStatusUseCase: GetOnboardingStatusUseCase,
  ) {}

  async seedStarterCatalog(userId: string): Promise<CatalogSeedResult> {
    try {
      return await this.seedUserCatalogUseCase.execute(userId);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Starter catalog could not be created for ${userId}, the account is still usable: ${reason}`,
      );
      return NOTHING_SEEDED;
    }
  }

  async getStatus(userId: string): Promise<OnboardingStatus> {
    return this.getOnboardingStatusUseCase.execute(userId);
  }

  async bootstrap(userId: string): Promise<OnboardingStatus> {
    await this.seedStarterCatalog(userId);
    return this.getStatus(userId);
  }
}
