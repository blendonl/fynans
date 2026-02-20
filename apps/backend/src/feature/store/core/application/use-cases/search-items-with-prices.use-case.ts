import { Injectable, Inject } from '@nestjs/common';
import { IStoreItemRepository, ItemWithPricesRow } from '../../domain/repositories/store-item.repository.interface';
import { Pagination } from '~common/dto/pagination.dto';

export { ItemWithPricesRow as ItemWithPricesResult };

@Injectable()
export class SearchItemsWithPricesUseCase {
  constructor(
    @Inject('StoreItemRepository')
    private readonly storeItemRepository: IStoreItemRepository,
  ) {}

  async execute(
    userId: string,
    search?: string,
    pagination?: Pagination,
  ): Promise<{ data: ItemWithPricesRow[]; total: number }> {
    return this.storeItemRepository.searchWithPrices(userId, search, pagination);
  }
}
