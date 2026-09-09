import { Injectable, Inject } from '@nestjs/common';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
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
      throw new DomainNotFoundException('Payment method not found');
    }

    if (paymentMethod.userId !== userId) {
      throw new DomainNotFoundException('Payment method not found');
    }

    return paymentMethod;
  }
}
