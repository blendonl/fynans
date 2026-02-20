import { Injectable, Inject } from '@nestjs/common';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
import { type IItemRepository } from '../../domain/repositories/item.repository.interface';
import { Item } from '../../domain/entities/item.entity';

@Injectable()
export class GetItemByIdUseCase {
  constructor(
    @Inject('ItemRepository')
    private readonly itemRepository: IItemRepository,
  ) {}

  async execute(id: string): Promise<Item> {
    const item = await this.itemRepository.findById(id);

    if (!item) {
      throw new DomainNotFoundException(`Item with ID ${id} not found`);
    }

    return item;
  }
}
