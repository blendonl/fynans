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

  async execute(
    dto: CreateStoreItemCategoryDto,
    userId: string,
  ): Promise<StoreItemCategory> {
    await this.validate(dto);

    const existing = await this.storeItemCategoryRepository.findByName(dto.name);
    if (existing) {
      await this.storeItemCategoryRepository.linkToUser(existing.id, userId);
      return existing;
    }

    const category = await this.storeItemCategoryRepository.create({
      name: dto.name,
      parentId: dto.parentId ?? null,
    } as Partial<StoreItemCategory>);

    await this.storeItemCategoryRepository.linkToUser(category.id, userId);

    return category;
  }

  private async validate(dto: CreateStoreItemCategoryDto): Promise<void> {
    if (!dto.name || dto.name.trim() === '') {
      throw new BadRequestException('Category name is required');
    }

    if (dto.parentId) {
      const parent =
        await this.storeItemCategoryRepository.findById(dto.parentId);
      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
    }
  }
}
