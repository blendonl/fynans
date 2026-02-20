import { Injectable, Inject } from '@nestjs/common';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
import { type IStoreItemDiscountRepository } from '../../domain/repositories/store-item-discount.repository.interface';
import { type IStoreItemRepository } from '../../../../store/core/domain/repositories/store-item.repository.interface';
import { StoreItemDiscount } from '../../domain/entities/store-item-discount.entity';

@Injectable()
export class EndDiscountUseCase {
  constructor(
    @Inject('StoreItemDiscountRepository')
    private readonly discountRepository: IStoreItemDiscountRepository,
    @Inject('StoreItemRepository')
    private readonly storeItemRepository: IStoreItemRepository,
  ) {}

  async execute(id: string): Promise<StoreItemDiscount> {
    // Check if discount exists
    const existingDiscount = await this.discountRepository.findById(id);
    if (!existingDiscount) {
      throw new DomainNotFoundException(`Discount with ID ${id} not found`);
    }

    // End the discount
    const discount = await this.discountRepository.endDiscount(id);

    // Update StoreItem.isDiscounted flag
    await this.storeItemRepository.update(existingDiscount.storeItemId, {
      isDiscounted: false,
    } as any);

    return discount;
  }
}
