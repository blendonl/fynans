import { Injectable, Inject, Logger } from '@nestjs/common';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
import { type IPaymentMethodRepository } from '../../domain/repositories/payment-method.repository.interface';

@Injectable()
export class RecalculateBalanceUseCase {
  private readonly logger = new Logger(RecalculateBalanceUseCase.name);

  constructor(
    @Inject('PaymentMethodRepository')
    private readonly paymentMethodRepository: IPaymentMethodRepository,
  ) {}

  async execute(id: string): Promise<void> {
    try {
      await this.paymentMethodRepository.recalculateBalance(id);
    } catch (error) {
      if (error instanceof DomainNotFoundException) {
        this.logger.warn(
          `Skipped balance recalculation for missing payment method ${id}`,
        );
        return;
      }
      throw error;
    }
  }
}
