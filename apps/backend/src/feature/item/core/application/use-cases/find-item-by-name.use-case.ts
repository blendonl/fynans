import { Injectable, Inject } from '@nestjs/common';
import { type IItemRepository } from '../../domain/repositories/item.repository.interface';
import { Item } from '../../domain/entities/item.entity';

@Injectable()
export class FindItemByNameUseCase {
  constructor(
    @Inject('ItemRepository')
    private readonly itemRepository: IItemRepository,
  ) {}

  async execute(name: string, userId: string): Promise<Item | null> {
    return await this.itemRepository.findOwnedByName(name, userId);
  }
}
