import { Injectable, Inject } from '@nestjs/common';
import { DomainValidationException } from '~common/exceptions/domain.exceptions';
import { type IPaymentMethodRepository } from '../../domain/repositories/payment-method.repository.interface';
import { CreatePaymentMethodDto } from '../dto/create-payment-method.dto';
import { PaymentMethod } from '../../domain/entities/payment-method.entity';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CreatePaymentMethodUseCase {
  constructor(
    @Inject('PaymentMethodRepository')
    private readonly paymentMethodRepository: IPaymentMethodRepository,
  ) {}

  async execute(dto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    if (!dto.userId || dto.userId.trim() === '') {
      throw new DomainValidationException('User ID is required');
    }

    if (!dto.name || dto.name.trim() === '') {
      throw new DomainValidationException('Payment method name is required');
    }

    const existing = await this.paymentMethodRepository.findByUserIdAndName(
      dto.userId,
      dto.name,
    );
    if (existing) {
      throw new DomainValidationException(
        'A payment method with this name already exists',
      );
    }

    const initialBalance = new Decimal(dto.initialBalance ?? 0);

    return this.paymentMethodRepository.create({
      id: uuid(),
      userId: dto.userId,
      name: dto.name.trim(),
      type: dto.type,
      color: dto.color ?? '#6366F1',
      initialBalance,
      currentBalance: initialBalance,
    });
  }
}
