import { Injectable, Inject } from '@nestjs/common';
import {
  type IStoreItemDiscountRepository,
  PaginatedResult,
} from '../../domain/repositories/store-item-discount.repository.interface';
import { StoreItemDiscount } from '../../domain/entities/store-item-discount.entity';
import { Pagination } from '~common/dto/pagination.dto';

@Injectable()
export class ListStoreItemDiscountsUseCase {
  constructor(
    @Inject('StoreItemDiscountRepository')
    private readonly discountRepository: IStoreItemDiscountRepository,
  ) {}

  async execute(
    storeItemId: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<StoreItemDiscount>> {
    return await this.discountRepository.findByStoreItemId(
      storeItemId,
      pagination,
    );
  }
}
