import { Injectable, Inject } from '@nestjs/common';
import { IBasketRepository } from '../../domain/repositories/basket.repository.interface';
import { FamilyService } from '../../../../family/core/application/services/family.service';
import { BasketScope } from '../../domain/entities/basket.entity';
import {
  DomainForbiddenException,
  DomainNotFoundException,
} from '~common/exceptions/domain.exceptions';

@Injectable()
export class RemoveBasketItemUseCase {
  constructor(
    @Inject('BasketRepository')
    private readonly basketRepository: IBasketRepository,
    private readonly familyService: FamilyService,
  ) {}

  async execute(itemId: string, userId: string): Promise<void> {
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

    await this.basketRepository.removeItem(itemId);
  }
}
