import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { IBasketRepository } from '../../domain/repositories/basket.repository.interface';
import { IFamilyRepository } from '../../../../family/core/domain/repositories/family.repository.interface';
import { CreateNotificationUseCase } from '../../../../notification/core/application/use-cases/create-notification.use-case';
import { UserService } from '../../../../user/core/application/services/user.service';
import { CheckoutBasketItemsDto } from '../dto/checkout-basket-items.dto';
import { BasketScope } from '../../domain/entities/basket.entity';
import { CreateExpenseDto } from '../../../../expense/core/application/dto/create-expense.dto';
import { CreateExpenseItemDto } from '../../../../expense-item/core/application/dto/create-expense-item.dto';
import {
  NotificationType,
  DeliveryMethod,
  NotificationPriority,
} from '../../../../notification/core/domain/value-objects/notification-type.vo';
import { ExpenseService } from '../../../../expense/core/application/services/expense.service';

@Injectable()
export class CheckoutBasketItemsUseCase {
  private readonly logger = new Logger(CheckoutBasketItemsUseCase.name);

  constructor(
    @Inject('BasketRepository')
    private readonly basketRepository: IBasketRepository,
    @Inject('FamilyRepository')
    private readonly familyRepository: IFamilyRepository,
    private readonly expenseService: ExpenseService,
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly userService: UserService,
  ) {}

  async execute(dto: CheckoutBasketItemsDto): Promise<{ expenseId: string }> {
    const basket = await this.basketRepository.findById(dto.basketId);
    if (!basket) {
      throw new NotFoundException('Basket not found');
    }

    // Authorization check
    if (basket.scope === BasketScope.PERSONAL) {
      if (basket.userId !== dto.userId) {
        throw new ForbiddenException('Not authorized');
      }
    } else if (basket.scope === BasketScope.FAMILY && basket.familyId) {
      const member = await this.familyRepository.findMember(
        basket.familyId,
        dto.userId,
      );
      if (!member) {
        throw new ForbiddenException('Not a member of this family');
      }
    }

    // Fetch the items to checkout
    const items = await this.basketRepository.findItemsByIds(dto.itemIds);
    if (items.length === 0) {
      throw new BadRequestException('No items found');
    }

    // Validate all items belong to this basket
    const invalidItems = items.filter((item) => item.basketId !== dto.basketId);
    if (invalidItems.length > 0) {
      throw new BadRequestException('Some items do not belong to this basket');
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
      // Persist the overrides to the basket items
      await Promise.all(
        dto.itemOverrides.map((o) =>
          this.basketRepository.updateItem(o.id, {
            ...(o.price !== undefined && { price: o.price }),
            ...(o.quantity !== undefined && { quantity: o.quantity }),
          }),
        ),
      );
    }

    // Validate all items have prices
    const itemsWithoutPrice = items.filter(
      (item) => item.price === null || item.price === undefined,
    );
    if (itemsWithoutPrice.length > 0) {
      throw new BadRequestException(
        `All items must have a price before checkout. Missing price for: ${itemsWithoutPrice.map((i) => i.name).join(', ')}`,
      );
    }

    // Calculate total value
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

    // Remove checked items from basket
    await this.basketRepository.removeItemsByIds(dto.itemIds);

    // Send notification to family members about the purchase
    if (basket.scope === BasketScope.FAMILY && basket.familyId) {
      const buyer = await this.userService.findById(dto.userId);
      const family = await this.familyRepository.findById(basket.familyId);
      const members = await this.familyRepository.findMembers(basket.familyId);

      await Promise.all(
        members
          .filter((member) => member.userId !== dto.userId)
          .map((member) =>
            this.createNotificationUseCase
              .execute({
                userId: member.userId,
                type: NotificationType.BASKET_ITEMS_BOUGHT,
                data: {
                  basketId: basket.id,
                  familyId: basket.familyId,
                  familyName: family?.name,
                  buyerName: buyer?.fullName,
                  itemCount: items.length,
                  totalAmount: totalValue.toFixed(2),
                },
                deliveryMethods: [DeliveryMethod.IN_APP, DeliveryMethod.PUSH],
                priority: NotificationPriority.LOW,
                familyId: basket.familyId ?? undefined,
              })
              .catch((err) => {
                this.logger.error(
                  `Failed to send checkout notification to user ${member.userId}`,
                  err?.stack ?? err,
                );
              }),
          ),
      );
    }

    return { expenseId: expense.id };
  }
}
