import { Injectable, Logger, Inject } from '@nestjs/common';
import { type IStoreItemCategoryRepository } from '~feature/store-item-category/core/domain/repositories/store-item-category.repository.interface';

@Injectable()
export class AutoCreateCategoriesUseCase {
  private readonly logger = new Logger(AutoCreateCategoriesUseCase.name);

  constructor(
    @Inject('StoreItemCategoryRepository')
    private readonly storeItemCategoryRepository: IStoreItemCategoryRepository,
  ) {}

  async execute(
    categoryNames: string[],
    userId: string,
  ): Promise<Map<string, string>> {
    const uniqueNames = [...new Set(categoryNames.filter(Boolean))];
    const categoryMap = new Map<string, string>();

    for (const name of uniqueNames) {
      try {
        let category = await this.storeItemCategoryRepository.findByName(name);

        if (!category) {
          category = await this.storeItemCategoryRepository.create({
            name,
          } as any);
          this.logger.log(`Auto-created item category: ${name}`);
        }

        await this.storeItemCategoryRepository
          .linkToUser(category.id, userId)
          .catch(() => {
            // Already linked — ignore
          });

        categoryMap.set(name, category.id);
      } catch (error) {
        this.logger.warn(
          `Failed to create/link category "${name}": ${error instanceof Error ? error.message : error}`,
        );
      }
    }

    return categoryMap;
  }
}
