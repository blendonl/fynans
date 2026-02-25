import { Injectable, Inject } from '@nestjs/common';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
import { type IStoreItemRepository } from '../../domain/repositories/store-item.repository.interface';

@Injectable()
export class DeleteStoreItemUseCase {
  constructor(
    @Inject('StoreItemRepository')
    private readonly storeItemRepository: IStoreItemRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.storeItemRepository.findById(id);
    if (!existing) {
      throw new DomainNotFoundException('Store item not found');
    }

    await this.storeItemRepository.delete(id);
  }
}
