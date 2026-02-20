import { Injectable, Inject, NotFoundException } from '@nestjs/common';
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
      throw new NotFoundException('Payment method not found');
    }

    if (paymentMethod.userId !== userId) {
      throw new NotFoundException('Payment method not found');
    }

    await this.paymentMethodRepository.delete(id);
  }
}
