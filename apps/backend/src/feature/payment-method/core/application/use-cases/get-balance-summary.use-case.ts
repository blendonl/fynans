import { Injectable, Inject } from '@nestjs/common';
import {
  type IPaymentMethodRepository,
  BalanceSummaryItem,
} from '../../domain/repositories/payment-method.repository.interface';

@Injectable()
export class GetBalanceSummaryUseCase {
  constructor(
    @Inject('PaymentMethodRepository')
    private readonly paymentMethodRepository: IPaymentMethodRepository,
  ) {}

  async execute(userId: string): Promise<BalanceSummaryItem[]> {
    return this.paymentMethodRepository.getBalanceSummary(userId);
  }
}
