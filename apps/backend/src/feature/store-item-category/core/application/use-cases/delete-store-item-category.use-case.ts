import { Injectable, Inject } from '@nestjs/common';
import {
  DomainNotFoundException,
  DomainValidationException,
} from '~common/exceptions/domain.exceptions';
import { type IStoreItemCategoryRepository } from '../../domain/repositories/store-item-category.repository.interface';
import { PrismaService } from '~common/prisma/prisma.service';

@Injectable()
export class DeleteStoreItemCategoryUseCase {
  constructor(
    @Inject('StoreItemCategoryRepository')
    private readonly storeItemCategoryRepository: IStoreItemCategoryRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(id: string): Promise<void> {
    const category = await this.storeItemCategoryRepository.findById(id);

    if (!category) {
      throw new DomainNotFoundException('Store item category not found');
    }

    await this.validate(id);

    await this.storeItemCategoryRepository.delete(id);
  }

  private async validate(id: string): Promise<void> {
    const children = await this.storeItemCategoryRepository.findChildren(id);
    if (children.length > 0) {
      throw new DomainValidationException(
        'Cannot delete category with child categories',
      );
    }

    const itemCount = await this.prisma.item.count({
      where: { categoryId: id },
    });
    if (itemCount > 0) {
      throw new DomainValidationException(
        'Cannot delete category that is used by existing items',
      );
    }
  }
}
