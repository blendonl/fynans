import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { FamilyCoreModule } from '../../family/core/family-core.module';
import { NotificationModule } from '../../notification/notification.module';
import { UserCoreModule } from '../../user/core/user-core.module';
import { ExpenseCoreModule } from '../../expense/core/expense-core.module';
import { PrismaBasketRepository } from './infrastructure/repositories/prisma-basket.repository';
import { ListBasketsUseCase } from './application/use-cases/list-baskets.use-case';
import { AddBasketItemUseCase } from './application/use-cases/add-basket-item.use-case';
import { UpdateBasketItemUseCase } from './application/use-cases/update-basket-item.use-case';
import { RemoveBasketItemUseCase } from './application/use-cases/remove-basket-item.use-case';
import { CheckoutBasketItemsUseCase } from './application/use-cases/checkout-basket-items.use-case';
import { BasketService } from './application/services/basket.service';

@Module({
  imports: [
    PrismaModule,
    FamilyCoreModule,
    forwardRef(() => NotificationModule),
    UserCoreModule,
    ExpenseCoreModule,
  ],
  providers: [
    {
      provide: 'BasketRepository',
      useClass: PrismaBasketRepository,
    },
    ListBasketsUseCase,
    AddBasketItemUseCase,
    UpdateBasketItemUseCase,
    RemoveBasketItemUseCase,
    CheckoutBasketItemsUseCase,
    BasketService,
  ],
  exports: [BasketService],
})
export class BasketCoreModule {}
