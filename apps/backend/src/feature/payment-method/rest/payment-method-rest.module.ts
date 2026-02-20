import { Module } from '@nestjs/common';
import { PaymentMethodCoreModule } from '../core/payment-method-core.module';
import { PaymentMethodController } from './controllers/payment-method.controller';

@Module({
  imports: [PaymentMethodCoreModule],
  controllers: [PaymentMethodController],
})
export class PaymentMethodRestModule {}
