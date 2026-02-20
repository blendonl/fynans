import { Injectable, Inject } from '@nestjs/common';
import {
  type IItemRepository,
  PaginatedResult,
} from '../../domain/repositories/item.repository.interface';
import { Item } from '../../domain/entities/item.entity';
import { Pagination } from '~common/dto/pagination.dto';

@Injectable()
export class ListItemsUseCase {
  constructor(
    @Inject('ItemRepository')
    private readonly itemRepository: IItemRepository,
  ) {}

  async execute(
    userId: string,
    categoryId?: string,
    filters?: { search?: string },
    pagination?: Pagination,
  ): Promise<PaginatedResult<Item>> {
    if (categoryId) {
      return await this.itemRepository.findByCategoryId(
        userId,
        categoryId,
        pagination,
      );
    }

    return await this.itemRepository.findAll(userId, filters, pagination);
  }
}
