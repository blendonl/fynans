import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { IBasketRepository } from '../../domain/repositories/basket.repository.interface';
import { IFamilyRepository } from '../../../../family/core/domain/repositories/family.repository.interface';
import { CreateNotificationUseCase } from '../../../../notification/core/application/use-cases/create-notification.use-case';
import { UserService } from '../../../../user/core/application/services/user.service';
import { AddBasketItemDto } from '../dto/add-basket-item.dto';
import { BasketItem } from '../../domain/entities/basket-item.entity';
import { BasketScope } from '../../domain/entities/basket.entity';
import {
  NotificationType,
  DeliveryMethod,
  NotificationPriority,
} from '../../../../notification/core/domain/value-objects/notification-type.vo';

@Injectable()
export class AddBasketItemUseCase {
  constructor(
    @Inject('BasketRepository')
    private readonly basketRepository: IBasketRepository,
    @Inject('FamilyRepository')
    private readonly familyRepository: IFamilyRepository,
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly userService: UserService,
  ) {}

  async execute(dto: AddBasketItemDto): Promise<BasketItem> {
    if (!dto.name || dto.name.trim() === '') {
      throw new BadRequestException('Item name is required');
    }

    if (dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be positive');
    }

    if (dto.price !== undefined && dto.price !== null && dto.price < 0) {
      throw new BadRequestException('Price must be non-negative');
    }

    const basket = await this.basketRepository.findById(dto.basketId);
    if (!basket) {
      throw new NotFoundException('Basket not found');
    }

    // Authorization check
    if (basket.scope === BasketScope.PERSONAL) {
      if (basket.userId !== dto.addedBy) {
        throw new ForbiddenException('Not authorized to add items to this basket');
      }
    } else if (basket.scope === BasketScope.FAMILY && basket.familyId) {
      const member = await this.familyRepository.findMember(
        basket.familyId,
        dto.addedBy,
      );
      if (!member) {
        throw new ForbiddenException('Not a member of this family');
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

    // Send notification to family members
    if (basket.scope === BasketScope.FAMILY && basket.familyId) {
      const addedByUser = await this.userService.findById(dto.addedBy);
      const family = await this.familyRepository.findById(basket.familyId);
      const members = await this.familyRepository.findMembers(basket.familyId);

      for (const member of members) {
        if (member.userId === dto.addedBy) continue;

        await this.createNotificationUseCase.execute({
          userId: member.userId,
          type: NotificationType.BASKET_ITEM_ADDED,
          data: {
            basketId: basket.id,
            familyId: basket.familyId,
            familyName: family?.name,
            addedByName: addedByUser?.fullName,
            itemName: dto.name,
          },
          deliveryMethods: [DeliveryMethod.IN_APP, DeliveryMethod.TOAST],
          priority: NotificationPriority.LOW,
          familyId: basket.familyId,
        });
      }
    }

    return item;
  }
}
