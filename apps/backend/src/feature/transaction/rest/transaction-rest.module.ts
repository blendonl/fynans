import { Module } from '@nestjs/common';
import { TransactionCoreModule } from '../core/transaction-core.module';
import { PaymentMethodCoreModule } from '../../payment-method/core/payment-method-core.module';
import { TransactionController } from './controllers/transaction.controller';

@Module({
  imports: [TransactionCoreModule, PaymentMethodCoreModule],
  controllers: [TransactionController],
})
export class TransactionRestModule {}
