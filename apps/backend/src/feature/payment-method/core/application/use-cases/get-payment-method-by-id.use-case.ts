import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { type IPaymentMethodRepository } from '../../domain/repositories/payment-method.repository.interface';
import { PaymentMethod } from '../../domain/entities/payment-method.entity';

@Injectable()
export class GetPaymentMethodByIdUseCase {
  constructor(
    @Inject('PaymentMethodRepository')
    private readonly paymentMethodRepository: IPaymentMethodRepository,
  ) {}

  async execute(id: string, userId: string): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodRepository.findById(id);

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    if (paymentMethod.userId !== userId) {
      throw new NotFoundException('Payment method not found');
    }

    return paymentMethod;
  }
}
