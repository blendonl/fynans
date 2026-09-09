import { Injectable, Inject } from '@nestjs/common';
import { DomainForbiddenException } from '~common/exceptions/domain.exceptions';
import { type IPaymentMethodRepository } from '../../domain/repositories/payment-method.repository.interface';

@Injectable()
export class VerifyPaymentMethodOwnershipUseCase {
  constructor(
    @Inject('PaymentMethodRepository')
    private readonly paymentMethodRepository: IPaymentMethodRepository,
  ) {}

  async execute(paymentMethodId: string, userId: string): Promise<void> {
    const paymentMethod =
      await this.paymentMethodRepository.findById(paymentMethodId);

    if (!paymentMethod || paymentMethod.userId !== userId) {
      throw new DomainForbiddenException(
        'Payment method does not belong to this user',
      );
    }
  }
}
