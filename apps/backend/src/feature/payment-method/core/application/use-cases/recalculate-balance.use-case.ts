import { Injectable, Inject } from '@nestjs/common';
import { type IPaymentMethodRepository } from '../../domain/repositories/payment-method.repository.interface';

@Injectable()
export class RecalculateBalanceUseCase {
  constructor(
    @Inject('PaymentMethodRepository')
    private readonly paymentMethodRepository: IPaymentMethodRepository,
  ) {}

  async execute(id: string): Promise<void> {
    try {
      await this.paymentMethodRepository.recalculateBalance(id);
    } catch {
      // Silently skip if payment method was deleted
    }
  }
}
