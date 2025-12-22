import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
      throw new NotFoundException('Store item category not found');
    }

    await this.validate(id, dto);

    const updated = await this.storeItemCategoryRepository.update(id, {
      name: dto.name,
      parentId: dto.parentId,
    } as Partial<StoreItemCategory>);

    return updated;
  }

  private async validate(
    id: string,
    dto: UpdateStoreItemCategoryDto,
  ): Promise<void> {
    // Validate parent exists and prevent circular reference
    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      if (dto.parentId !== null) {
        const parent =
          await this.storeItemCategoryRepository.findById(dto.parentId);
        if (!parent) {
          throw new BadRequestException('Parent category not found');
        }

        // Check if new parent is a descendant of current category
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
        throw new BadRequestException('Circular reference detected');
      }

      const current = await this.storeItemCategoryRepository.findById(currentId);
      if (!current) {
        break;
      }
      currentId = current.parentId;
    }
  }
}
