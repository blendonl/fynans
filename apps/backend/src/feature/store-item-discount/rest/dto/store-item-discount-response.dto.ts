import { ApiProperty } from '@nestjs/swagger';
import { StoreItemDiscount } from '../../core/domain/entities/store-item-discount.entity';

export class StoreItemDiscountResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  storeItemId: string;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  startedAt: Date;

  @ApiProperty({ nullable: true })
  endedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  isActive: boolean;

  static fromEntity(
    discount: StoreItemDiscount,
  ): StoreItemDiscountResponseDto {
    return {
      id: discount.id,
      storeItemId: discount.storeItemId,
      discount: discount.discount.toNumber(),
      startedAt: discount.startedAt,
      endedAt: discount.endedAt,
      createdAt: discount.createdAt,
      updatedAt: discount.updatedAt,
      isActive: discount.isActive(),
    };
  }

  static fromEntities(
    discounts: StoreItemDiscount[],
  ): StoreItemDiscountResponseDto[] {
    return discounts.map((discount) => this.fromEntity(discount));
  }
}
