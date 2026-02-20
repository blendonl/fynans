import { Injectable, Inject } from '@nestjs/common';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
import { type IStoreItemDiscountRepository } from '../../domain/repositories/store-item-discount.repository.interface';

@Injectable()
export class DeleteStoreItemDiscountUseCase {
  constructor(
    @Inject('StoreItemDiscountRepository')
    private readonly discountRepository: IStoreItemDiscountRepository,
  ) {}

  async execute(id: string): Promise<void> {
    // Check if discount exists
    const discount = await this.discountRepository.findById(id);
    if (!discount) {
      throw new DomainNotFoundException(`Discount with ID ${id} not found`);
    }

    await this.discountRepository.delete(id);
  }
}
