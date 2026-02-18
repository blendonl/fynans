import {
  Injectable,
  Inject,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { IBasketRepository } from '../../domain/repositories/basket.repository.interface';
import { IFamilyRepository } from '../../../../family/core/domain/repositories/family.repository.interface';
import { BasketScope } from '../../domain/entities/basket.entity';

@Injectable()
export class RemoveBasketItemUseCase {
  constructor(
    @Inject('BasketRepository')
    private readonly basketRepository: IBasketRepository,
    @Inject('FamilyRepository')
    private readonly familyRepository: IFamilyRepository,
  ) {}

  async execute(itemId: string, userId: string): Promise<void> {
    const item = await this.basketRepository.findItemById(itemId);
    if (!item) {
      throw new NotFoundException('Basket item not found');
    }

    const basket = await this.basketRepository.findById(item.basketId);
    if (!basket) {
      throw new NotFoundException('Basket not found');
    }

    // Authorization check
    if (basket.scope === BasketScope.PERSONAL) {
      if (basket.userId !== userId) {
        throw new ForbiddenException('Not authorized');
      }
    } else if (basket.scope === BasketScope.FAMILY && basket.familyId) {
      const member = await this.familyRepository.findMember(
        basket.familyId,
        userId,
      );
      if (!member) {
        throw new ForbiddenException('Not a member of this family');
      }
    }

    await this.basketRepository.removeItem(itemId);
  }
}
