import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
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
      throw new NotFoundException(`Discount with ID ${id} not found`);
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
      throw new BadRequestException('Cannot update an already ended discount');
    }

    if (dto.discount !== undefined && dto.discount <= 0) {
      throw new BadRequestException('Discount must be greater than 0');
    }

    if (dto.endedAt && dto.endedAt < existingDiscount.startedAt) {
      throw new BadRequestException('End date must be after start date');
    }
  }
}
