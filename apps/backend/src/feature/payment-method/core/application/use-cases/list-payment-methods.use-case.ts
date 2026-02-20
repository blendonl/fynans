import { Injectable, Inject } from '@nestjs/common';
import { type IPaymentMethodRepository } from '../../domain/repositories/payment-method.repository.interface';
import { PaymentMethod } from '../../domain/entities/payment-method.entity';

@Injectable()
export class ListPaymentMethodsUseCase {
  constructor(
    @Inject('PaymentMethodRepository')
    private readonly paymentMethodRepository: IPaymentMethodRepository,
  ) {}

  async execute(userId: string): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.findAllByUserId(userId);
  }
}
