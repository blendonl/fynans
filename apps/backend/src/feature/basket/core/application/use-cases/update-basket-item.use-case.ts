import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { IBasketRepository } from '../../domain/repositories/basket.repository.interface';
import { IFamilyRepository } from '../../../../family/core/domain/repositories/family.repository.interface';
import { UpdateBasketItemDto } from '../dto/update-basket-item.dto';
import { BasketItem } from '../../domain/entities/basket-item.entity';
import { BasketScope } from '../../domain/entities/basket.entity';

@Injectable()
export class UpdateBasketItemUseCase {
  constructor(
    @Inject('BasketRepository')
    private readonly basketRepository: IBasketRepository,
    @Inject('FamilyRepository')
    private readonly familyRepository: IFamilyRepository,
  ) {}

  async execute(
    itemId: string,
    dto: UpdateBasketItemDto,
    userId: string,
  ): Promise<BasketItem> {
    if (dto.quantity !== undefined && dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be positive');
    }

    if (dto.price !== undefined && dto.price !== null && dto.price < 0) {
      throw new BadRequestException('Price must be non-negative');
    }

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

    return this.basketRepository.updateItem(itemId, {
      name: dto.name,
      quantity: dto.quantity,
      price: dto.price,
      categoryId: dto.categoryId,
      notes: dto.notes,
    });
  }
}
