import { Injectable } from '@nestjs/common';
import { ListBasketsUseCase } from '../use-cases/list-baskets.use-case';
import { AddBasketItemUseCase } from '../use-cases/add-basket-item.use-case';
import { UpdateBasketItemUseCase } from '../use-cases/update-basket-item.use-case';
import { RemoveBasketItemUseCase } from '../use-cases/remove-basket-item.use-case';
import { CheckoutBasketItemsUseCase } from '../use-cases/checkout-basket-items.use-case';
import { AddBasketItemDto } from '../dto/add-basket-item.dto';
import { UpdateBasketItemDto } from '../dto/update-basket-item.dto';
import { CheckoutBasketItemsDto } from '../dto/checkout-basket-items.dto';
import { Basket } from '../../domain/entities/basket.entity';
import { BasketItem } from '../../domain/entities/basket-item.entity';

@Injectable()
export class BasketService {
  constructor(
    private readonly listBasketsUseCase: ListBasketsUseCase,
    private readonly addBasketItemUseCase: AddBasketItemUseCase,
    private readonly updateBasketItemUseCase: UpdateBasketItemUseCase,
    private readonly removeBasketItemUseCase: RemoveBasketItemUseCase,
    private readonly checkoutBasketItemsUseCase: CheckoutBasketItemsUseCase,
  ) {}

  async listBaskets(userId: string): Promise<Basket[]> {
    return this.listBasketsUseCase.execute(userId);
  }

  async addItem(dto: AddBasketItemDto): Promise<BasketItem> {
    return this.addBasketItemUseCase.execute(dto);
  }

  async updateItem(
    itemId: string,
    dto: UpdateBasketItemDto,
    userId: string,
  ): Promise<BasketItem> {
    return this.updateBasketItemUseCase.execute(itemId, dto, userId);
  }

  async removeItem(itemId: string, userId: string): Promise<void> {
    return this.removeBasketItemUseCase.execute(itemId, userId);
  }

  async checkout(dto: CheckoutBasketItemsDto): Promise<{ expenseId: string }> {
    return this.checkoutBasketItemsUseCase.execute(dto);
  }
}
