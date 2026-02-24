import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  Min,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateExpenseDto } from '../../core/application/dto/create-expense.dto';
import { CreateExpenseItemDto } from '../../../expense-item/core/application/dto/create-expense-item.dto';
import { TransactionStatus } from '~feature/transaction/core/domain/value-objects/transaction-status.vo';

export class CreateExpenseItemRequestDto {
  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  @IsString()
  @IsNotEmpty()
  itemName!: string;

  @IsNumber()
  @Min(0)
  itemPrice!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @IsNumber()
  @Min(0.001)
  @Type(() => Number)
  quantity!: number;

  @IsNumber()
  @Min(0.001)
  @IsOptional()
  @Type(() => Number)
  sizeValue?: number;

  @IsString()
  @IsOptional()
  sizeUnit?: string;
}

export class CreateExpenseRequestDto {
  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  @IsString()
  @IsOptional()
  storeName?: string;

  @IsString()
  @IsOptional()
  storeLocation?: string;

  @ApiProperty({ type: [CreateExpenseItemRequestDto], required: false })
  @ValidateNested({ each: true })
  @Type(() => CreateExpenseItemRequestDto)
  @IsOptional()
  items?: CreateExpenseItemRequestDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsUUID()
  familyId?: string;

  @ApiProperty({ enum: ['PERSONAL', 'FAMILY'], required: false })
  @IsOptional()
  @IsString()
  scope?: 'PERSONAL' | 'FAMILY';

  @IsOptional()
  @IsDateString()
  recordedAt?: string;

  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  pending?: boolean;

  toCoreDto(userId: string): CreateExpenseDto {
    return new CreateExpenseDto({
      userId,
      categoryId: this.categoryId,
      storeName: this.storeName,
      storeLocation: this.storeLocation,
      familyId: this.familyId,
      amount: this.amount,
      note: this.note,
      paymentMethodId: this.paymentMethodId,
      items: this.items?.map(
        (item) =>
          new CreateExpenseItemDto({
            expenseId: '',
            categoryId: item.categoryId,
            itemName: item.itemName,
            itemPrice: item.itemPrice,
            discount: item.discount,
            quantity: item.quantity,
            sizeValue: item.sizeValue,
            sizeUnit: item.sizeUnit,
          }),
      ),
      recordedAt: this.recordedAt ? new Date(this.recordedAt) : undefined,
      status: this.pending ? TransactionStatus.PENDING : undefined,
    });
  }
}
