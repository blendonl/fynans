import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { type IPaymentMethodRepository } from '../../domain/repositories/payment-method.repository.interface';
import { UpdatePaymentMethodDto } from '../dto/update-payment-method.dto';
import { PaymentMethod } from '../../domain/entities/payment-method.entity';
import { PaymentMethodType } from '../../domain/value-objects/payment-method-type.enum';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

@Injectable()
export class UpdatePaymentMethodUseCase {
  constructor(
    @Inject('PaymentMethodRepository')
    private readonly paymentMethodRepository: IPaymentMethodRepository,
  ) {}

  async execute(
    id: string,
    userId: string,
    dto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodRepository.findById(id);

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    if (paymentMethod.userId !== userId) {
      throw new NotFoundException('Payment method not found');
    }

    await this.validate(id, userId, dto);

    const updateData: {
      name?: string;
      type?: PaymentMethodType;
      color?: string;
      initialBalance?: Decimal;
    } = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name.trim();
    }

    if (dto.type !== undefined) {
      updateData.type = dto.type;
    }

    if (dto.color !== undefined) {
      updateData.color = dto.color;
    }

    if (dto.initialBalance !== undefined) {
      updateData.initialBalance = new Decimal(dto.initialBalance);
    }

    const updated = await this.paymentMethodRepository.update(id, updateData);

    // If initial balance changed, recalculate current balance
    if (dto.initialBalance !== undefined) {
      return this.paymentMethodRepository.recalculateBalance(id);
    }

    return updated;
  }

  private async validate(
    id: string,
    userId: string,
    dto: UpdatePaymentMethodDto,
  ): Promise<void> {
    if (dto.name) {
      const existing = await this.paymentMethodRepository.findByUserIdAndName(
        userId,
        dto.name,
      );
      if (existing && existing.id !== id) {
        throw new BadRequestException(
          'A payment method with this name already exists',
        );
      }
    }
  }
}
