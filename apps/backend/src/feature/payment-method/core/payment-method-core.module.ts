import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { FamilyCoreModule } from '../../family/core/family-core.module';
import { PrismaPaymentMethodRepository } from './infrastructure/repositories/prisma-payment-method.repository';
import { CreatePaymentMethodUseCase } from './application/use-cases/create-payment-method.use-case';
import { GetPaymentMethodByIdUseCase } from './application/use-cases/get-payment-method-by-id.use-case';
import { ListPaymentMethodsUseCase } from './application/use-cases/list-payment-methods.use-case';
import { UpdatePaymentMethodUseCase } from './application/use-cases/update-payment-method.use-case';
import { DeletePaymentMethodUseCase } from './application/use-cases/delete-payment-method.use-case';
import { RecalculateBalanceUseCase } from './application/use-cases/recalculate-balance.use-case';
import { GetBalanceSummaryUseCase } from './application/use-cases/get-balance-summary.use-case';
import { GetBalanceUseCase } from './application/use-cases/get-balance.use-case';
import { PaymentMethodService } from './application/services/payment-method.service';

@Module({
  imports: [PrismaModule, FamilyCoreModule],
  providers: [
    {
      provide: 'PaymentMethodRepository',
      useClass: PrismaPaymentMethodRepository,
    },
    CreatePaymentMethodUseCase,
    GetPaymentMethodByIdUseCase,
    ListPaymentMethodsUseCase,
    UpdatePaymentMethodUseCase,
    DeletePaymentMethodUseCase,
    RecalculateBalanceUseCase,
    GetBalanceSummaryUseCase,
    GetBalanceUseCase,
    PaymentMethodService,
  ],
  exports: [PaymentMethodService, 'PaymentMethodRepository'],
})
export class PaymentMethodCoreModule {}
