import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { type IStoreItemCategoryRepository } from '../../domain/repositories/store-item-category.repository.interface';

@Injectable()
export class DeleteStoreItemCategoryUseCase {
  constructor(
    @Inject('StoreItemCategoryRepository')
    private readonly storeItemCategoryRepository: IStoreItemCategoryRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const category = await this.storeItemCategoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Store item category not found');
    }

    await this.validate(id);

    await this.storeItemCategoryRepository.delete(id);
  }

  private async validate(id: string): Promise<void> {
    // Check if category has children
    const children = await this.storeItemCategoryRepository.findChildren(id);
    if (children.length > 0) {
      throw new BadRequestException(
        'Cannot delete category with child categories',
      );
    }

    // TODO: Check if category is used by any expense items
    // This will be implemented when ExpenseItem feature is ready
  }
}
