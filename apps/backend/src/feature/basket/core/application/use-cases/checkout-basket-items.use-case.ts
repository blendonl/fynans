import { Injectable, Inject, Logger } from '@nestjs/common';
import { IBasketRepository } from '../../domain/repositories/basket.repository.interface';
import { FamilyService } from '../../../../family/core/application/services/family.service';
import { NotifyFamilyMembersService } from '~common/services/notify-family-members.service';
import { CheckoutBasketItemsDto } from '../dto/checkout-basket-items.dto';
import { BasketScope } from '../../domain/entities/basket.entity';
import { CreateExpenseDto } from '../../../../expense/core/application/dto/create-expense.dto';
import { CreateExpenseItemDto } from '../../../../expense-item/core/application/dto/create-expense-item.dto';
import { NotificationType } from '../../../../notification/core/domain/value-objects/notification-type.vo';
import { ExpenseService } from '../../../../expense/core/application/services/expense.service';
import {
  DomainNotFoundException,
  DomainForbiddenException,
  DomainValidationException,
} from '~common/exceptions/domain.exceptions';

@Injectable()
export class CheckoutBasketItemsUseCase {
  private readonly logger = new Logger(CheckoutBasketItemsUseCase.name);

  constructor(
    @Inject('BasketRepository')
    private readonly basketRepository: IBasketRepository,
    private readonly familyService: FamilyService,
    private readonly expenseService: ExpenseService,
    private readonly notifyFamilyMembersService: NotifyFamilyMembersService,
  ) {}

  async execute(dto: CheckoutBasketItemsDto): Promise<{ expenseId: string }> {
    const basket = await this.basketRepository.findById(dto.basketId);
    if (!basket) {
      throw new DomainNotFoundException('Basket not found');
    }

    if (basket.scope === BasketScope.PERSONAL) {
      if (basket.userId !== dto.userId) {
        throw new DomainForbiddenException('Not authorized');
      }
    } else if (basket.scope === BasketScope.FAMILY && basket.familyId) {
      const member = await this.familyService.findMember(
        basket.familyId,
        dto.userId,
      );
      if (!member) {
        throw new DomainForbiddenException('Not a member of this family');
      }
    }

    const items = await this.basketRepository.findItemsByIds(dto.itemIds);
    if (items.length === 0) {
      throw new DomainValidationException('No items found');
    }

    const invalidItems = items.filter((item) => item.basketId !== dto.basketId);
    if (invalidItems.length > 0) {
      throw new DomainValidationException('Some items do not belong to this basket');
    }

    // Apply item overrides (price/quantity from the checkout dialog)
    if (dto.itemOverrides?.length) {
      const overrideMap = new Map(
        dto.itemOverrides.map((o) => [o.id, o]),
      );
      for (const item of items) {
        const override = overrideMap.get(item.id);
        if (!override) continue;
        item.update({
          price: override.price,
          quantity: override.quantity,
          categoryId: override.categoryId,
        });
      }
      await Promise.all(
        dto.itemOverrides.map((o) =>
          this.basketRepository.updateItem(o.id, {
            ...(o.price !== undefined && { price: o.price }),
            ...(o.quantity !== undefined && { quantity: o.quantity }),
          }),
        ),
      );
    }

    const itemsWithoutPrice = items.filter(
      (item) => item.price === null || item.price === undefined,
    );
    if (itemsWithoutPrice.length > 0) {
      throw new DomainValidationException(
        `All items must have a price before checkout. Missing price for: ${itemsWithoutPrice.map((i) => i.name).join(', ')}`,
      );
    }

    const totalValue = items.reduce((sum, item) => {
      return sum + (item.price! * item.quantity);
    }, 0);

    // Create expense via ExpenseService (reuse the full flow)
    const familyId = basket.scope === BasketScope.FAMILY ? basket.familyId : dto.familyId;

    const expense = await this.expenseService.create(
      new CreateExpenseDto({
        userId: dto.userId,
        categoryId: dto.categoryId,
        storeId: dto.storeId,
        items: items.map(
          (item) =>
            new CreateExpenseItemDto({
              expenseId: '',
              categoryId: item.categoryId || dto.categoryId,
              itemName: item.name,
              itemPrice: item.price!,
              quantity: item.quantity,
            }),
        ),
        familyId: familyId ?? undefined,
        recordedAt: dto.recordedAt,
      }),
    );

    await this.basketRepository.removeItemsByIds(dto.itemIds);

    if (basket.scope === BasketScope.FAMILY && basket.familyId) {
      await this.notifyFamilyMembersService.notify({
        familyId: basket.familyId,
        actorUserId: dto.userId,
        type: NotificationType.BASKET_ITEMS_BOUGHT,
        data: {
          basketId: basket.id,
          itemCount: items.length,
          totalAmount: totalValue.toFixed(2),
        },
      });
    }

    return { expenseId: expense.id };
  }
}
