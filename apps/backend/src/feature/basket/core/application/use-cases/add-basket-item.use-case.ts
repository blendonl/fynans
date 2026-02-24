import { Injectable, Inject } from '@nestjs/common';
import { IBasketRepository } from '../../domain/repositories/basket.repository.interface';
import { FamilyService } from '../../../../family/core/application/services/family.service';
import { NotifyFamilyMembersService } from '~common/services/notify-family-members.service';
import { AddBasketItemDto } from '../dto/add-basket-item.dto';
import { BasketItem } from '../../domain/entities/basket-item.entity';
import { BasketScope } from '../../domain/entities/basket.entity';
import { NotificationType } from '../../../../notification/core/domain/value-objects/notification-type.vo';
import {
  DomainValidationException,
  DomainForbiddenException,
  DomainNotFoundException,
} from '~common/exceptions/domain.exceptions';

@Injectable()
export class AddBasketItemUseCase {
  constructor(
    @Inject('BasketRepository')
    private readonly basketRepository: IBasketRepository,
    private readonly familyService: FamilyService,
    private readonly notifyFamilyMembersService: NotifyFamilyMembersService,
  ) {}

  async execute(dto: AddBasketItemDto): Promise<BasketItem> {
    if (!dto.name || dto.name.trim() === '') {
      throw new DomainValidationException('Item name is required');
    }

    if (dto.quantity <= 0) {
      throw new DomainValidationException('Quantity must be positive');
    }

    if (dto.price !== undefined && dto.price !== null && dto.price < 0) {
      throw new DomainValidationException('Price must be non-negative');
    }

    const basket = await this.basketRepository.findById(dto.basketId);
    if (!basket) {
      throw new DomainNotFoundException('Basket not found');
    }

    if (basket.scope === BasketScope.PERSONAL) {
      if (basket.userId !== dto.addedBy) {
        throw new DomainForbiddenException('Not authorized to add items to this basket');
      }
    } else if (basket.scope === BasketScope.FAMILY && basket.familyId) {
      const member = await this.familyService.findMember(
        basket.familyId,
        dto.addedBy,
      );
      if (!member) {
        throw new DomainForbiddenException('Not a member of this family');
      }
    }

    const item = await this.basketRepository.addItem({
      basketId: dto.basketId,
      name: dto.name.trim(),
      quantity: dto.quantity,
      price: dto.price,
      categoryId: dto.categoryId,
      notes: dto.notes,
      addedBy: dto.addedBy,
    });

    if (basket.scope === BasketScope.FAMILY && basket.familyId) {
      await this.notifyFamilyMembersService.notify({
        familyId: basket.familyId,
        actorUserId: dto.addedBy,
        type: NotificationType.BASKET_ITEM_ADDED,
        data: {
          basketId: basket.id,
          itemName: dto.name,
        },
      });
    }

    return item;
  }
}
