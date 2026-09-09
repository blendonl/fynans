import { Injectable, Inject } from '@nestjs/common';
import {
  DomainNotFoundException,
  DomainValidationException,
  DomainForbiddenException,
} from '~common/exceptions/domain.exceptions';
import { type IItemRepository } from '../../domain/repositories/item.repository.interface';
import { PrismaService } from '../../../../../common/prisma/prisma.service';

@Injectable()
export class DeleteItemUseCase {
  constructor(
    @Inject('ItemRepository')
    private readonly itemRepository: IItemRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const item = await this.itemRepository.findById(id);
    if (!item) {
      throw new DomainNotFoundException(`Item with ID ${id} not found`);
    }

    const linked = await this.itemRepository.isLinkedToUser(id, userId);
    if (!linked) {
      throw new DomainForbiddenException('Item does not belong to this user');
    }

    const storeItemCount = await this.prisma.storeItem.count({
      where: { itemId: id },
    });

    if (storeItemCount > 0) {
      throw new DomainValidationException(
        `Cannot delete item. It is referenced by ${storeItemCount} store item(s)`,
      );
    }

    await this.itemRepository.delete(id);
  }
}
