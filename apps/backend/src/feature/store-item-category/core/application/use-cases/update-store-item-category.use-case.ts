import { Injectable, Inject } from '@nestjs/common';
import {
  DomainNotFoundException,
  DomainValidationException,
} from '~common/exceptions/domain.exceptions';
import { type IStoreItemCategoryRepository } from '../../domain/repositories/store-item-category.repository.interface';
import { UpdateStoreItemCategoryDto } from '../dto/update-store-item-category.dto';
import { StoreItemCategory } from '../../domain/entities/store-item-category.entity';

@Injectable()
export class UpdateStoreItemCategoryUseCase {
  constructor(
    @Inject('StoreItemCategoryRepository')
    private readonly storeItemCategoryRepository: IStoreItemCategoryRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateStoreItemCategoryDto,
  ): Promise<StoreItemCategory> {
    const category = await this.storeItemCategoryRepository.findById(id);

    if (!category) {
      throw new DomainNotFoundException('Store item category not found');
    }

    await this.validate(id, dto);

    const updated = await this.storeItemCategoryRepository.update(id, {
      name: dto.name,
      parentId: dto.parentId,
    });

    return updated;
  }

  private async validate(
    id: string,
    dto: UpdateStoreItemCategoryDto,
  ): Promise<void> {
    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new DomainValidationException(
          'Category cannot be its own parent',
        );
      }

      if (dto.parentId !== null) {
        const parent = await this.storeItemCategoryRepository.findById(
          dto.parentId,
        );
        if (!parent) {
          throw new DomainValidationException('Parent category not found');
        }

        await this.checkCircularReference(id, dto.parentId);
      }
    }
  }

  private async checkCircularReference(
    categoryId: string,
    newParentId: string,
  ): Promise<void> {
    let currentId: string | null = newParentId;

    while (currentId !== null) {
      if (currentId === categoryId) {
        throw new DomainValidationException('Circular reference detected');
      }

      const current =
        await this.storeItemCategoryRepository.findById(currentId);
      if (!current) {
        break;
      }
      currentId = current.parentId;
    }
  }
}
