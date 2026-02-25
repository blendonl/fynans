import { Injectable, Inject } from '@nestjs/common';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
import {
  type IItemRepository,
  type ItemDetailResult,
} from '../../domain/repositories/item.repository.interface';

@Injectable()
export class GetItemByIdWithDetailUseCase {
  constructor(
    @Inject('ItemRepository')
    private readonly itemRepository: IItemRepository,
  ) {}

  async execute(id: string): Promise<ItemDetailResult> {
    const result = await this.itemRepository.findByIdWithDetail(id);
    if (!result) {
      throw new DomainNotFoundException(`Item with ID ${id} not found`);
    }
    return result;
  }
}
