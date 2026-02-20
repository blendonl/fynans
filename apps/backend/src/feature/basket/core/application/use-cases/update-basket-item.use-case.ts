import { Injectable, Inject } from '@nestjs/common';
import { IBasketRepository } from '../../domain/repositories/basket.repository.interface';
import { FamilyService } from '../../../../family/core/application/services/family.service';
import { UpdateBasketItemDto } from '../dto/update-basket-item.dto';
import { BasketItem } from '../../domain/entities/basket-item.entity';
import { BasketScope } from '../../domain/entities/basket.entity';
import {
  DomainValidationException,
  DomainForbiddenException,
  DomainNotFoundException,
} from '~common/exceptions/domain.exceptions';

@Injectable()
export class UpdateBasketItemUseCase {
  constructor(
    @Inject('BasketRepository')
    private readonly basketRepository: IBasketRepository,
    private readonly familyService: FamilyService,
  ) {}

  async execute(
    itemId: string,
    dto: UpdateBasketItemDto,
    userId: string,
  ): Promise<BasketItem> {
    if (dto.quantity !== undefined && dto.quantity <= 0) {
      throw new DomainValidationException('Quantity must be positive');
    }

    if (dto.price !== undefined && dto.price !== null && dto.price < 0) {
      throw new DomainValidationException('Price must be non-negative');
    }

    const item = await this.basketRepository.findItemById(itemId);
    if (!item) {
      throw new DomainNotFoundException('Basket item not found');
    }

    const basket = await this.basketRepository.findById(item.basketId);
    if (!basket) {
      throw new DomainNotFoundException('Basket not found');
    }

    // Authorization check
    if (basket.scope === BasketScope.PERSONAL) {
      if (basket.userId !== userId) {
        throw new DomainForbiddenException('Not authorized');
      }
    } else if (basket.scope === BasketScope.FAMILY && basket.familyId) {
      const member = await this.familyService.findMember(
        basket.familyId,
        userId,
      );
      if (!member) {
        throw new DomainForbiddenException('Not a member of this family');
      }
    }

    return this.basketRepository.updateItem(itemId, {
      name: dto.name,
      quantity: dto.quantity,
      price: dto.price,
      categoryId: dto.categoryId,
      notes: dto.notes,
    });
  }
}
