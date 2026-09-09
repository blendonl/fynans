import { Injectable, Inject } from '@nestjs/common';
import {
  DomainNotFoundException,
  DomainValidationException,
} from '~common/exceptions/domain.exceptions';
import { type IStoreItemDiscountRepository } from '../../domain/repositories/store-item-discount.repository.interface';
import { UpdateStoreItemDiscountDto } from '../dto/update-store-item-discount.dto';
import { StoreItemDiscount } from '../../domain/entities/store-item-discount.entity';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

@Injectable()
export class UpdateStoreItemDiscountUseCase {
  constructor(
    @Inject('StoreItemDiscountRepository')
    private readonly discountRepository: IStoreItemDiscountRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateStoreItemDiscountDto,
  ): Promise<StoreItemDiscount> {
    const existingDiscount = await this.discountRepository.findById(id);
    if (!existingDiscount) {
      throw new DomainNotFoundException(`Discount with ID ${id} not found`);
    }

    await this.validate(existingDiscount, dto);

    const discount = await this.discountRepository.update(id, {
      discount: dto.discount ? new Decimal(dto.discount) : undefined,
      endedAt: dto.endedAt,
    } as Partial<StoreItemDiscount>);

    return discount;
  }

  private async validate(
    existingDiscount: StoreItemDiscount,
    dto: UpdateStoreItemDiscountDto,
  ): Promise<void> {
    if (existingDiscount.endedAt && existingDiscount.endedAt < new Date()) {
      throw new DomainValidationException(
        'Cannot update an already ended discount',
      );
    }

    if (dto.discount !== undefined && dto.discount <= 0) {
      throw new DomainValidationException('Discount must be greater than 0');
    }

    if (dto.endedAt && dto.endedAt < existingDiscount.startedAt) {
      throw new DomainValidationException('End date must be after start date');
    }
  }
}
