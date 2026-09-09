import { Injectable, Inject } from '@nestjs/common';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
import { type IPaymentMethodRepository } from '../../domain/repositories/payment-method.repository.interface';

@Injectable()
export class DeletePaymentMethodUseCase {
  constructor(
    @Inject('PaymentMethodRepository')
    private readonly paymentMethodRepository: IPaymentMethodRepository,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const paymentMethod = await this.paymentMethodRepository.findById(id);

    if (!paymentMethod) {
      throw new DomainNotFoundException('Payment method not found');
    }

    if (paymentMethod.userId !== userId) {
      throw new DomainNotFoundException('Payment method not found');
    }

    await this.paymentMethodRepository.delete(id);
  }
}
