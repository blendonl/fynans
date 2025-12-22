import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { type IStoreItemCategoryRepository } from '../../domain/repositories/store-item-category.repository.interface';
import { CreateStoreItemCategoryDto } from '../dto/create-store-item-category.dto';
import { StoreItemCategory } from '../../domain/entities/store-item-category.entity';

@Injectable()
export class CreateStoreItemCategoryUseCase {
  constructor(
    @Inject('StoreItemCategoryRepository')
    private readonly storeItemCategoryRepository: IStoreItemCategoryRepository,
  ) {}

  async execute(dto: CreateStoreItemCategoryDto): Promise<StoreItemCategory> {
    await this.validate(dto);

    const category = await this.storeItemCategoryRepository.create({
      name: dto.name,
      parentId: dto.parentId ?? null,
    } as Partial<StoreItemCategory>);

    return category;
  }

  private async validate(dto: CreateStoreItemCategoryDto): Promise<void> {
    if (!dto.name || dto.name.trim() === '') {
      throw new BadRequestException('Category name is required');
    }

    // Validate parent exists if provided
    if (dto.parentId) {
      const parent =
        await this.storeItemCategoryRepository.findById(dto.parentId);
      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
    }
  }
}
