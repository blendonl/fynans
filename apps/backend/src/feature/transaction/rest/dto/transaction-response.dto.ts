import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Transaction,
  TransactionScope,
  TransactionUser,
} from '../../core/domain/entities/transaction.entity';
import { TransactionType } from '../../core/domain/value-objects/transaction-type.vo';
import { TransactionStatus } from '../../core/domain/value-objects/transaction-status.vo';

export class TransactionUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ nullable: true })
  image?: string | null;
}

export class TransactionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: TransactionType })
  type: TransactionType;

  @ApiProperty({ enum: TransactionScope })
  scope: TransactionScope;

  @ApiProperty()
  value: number;

  @ApiProperty({ enum: TransactionStatus })
  status: TransactionStatus;

  @ApiPropertyOptional()
  paymentMethodId?: string;

  @ApiPropertyOptional()
  rejectionReason?: string;

  @ApiProperty()
  recordedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: () => TransactionUserDto })
  user: TransactionUser;

  constructor(transaction: Transaction) {
    this.id = transaction.id;
    this.userId = transaction.userId;
    this.type = transaction.type;
    this.scope = transaction.scope;
    this.status = transaction.status;
    this.value = transaction.value.toNumber();
    this.paymentMethodId = transaction.paymentMethodId;
    this.rejectionReason = transaction.rejectionReason;
    this.recordedAt = transaction.recordedAt;
    this.createdAt = transaction.createdAt;
    this.updatedAt = transaction.updatedAt;
    this.user = transaction.user;
  }

  static fromEntity(transaction: Transaction): TransactionResponseDto {
    return new TransactionResponseDto(transaction);
  }

  static fromEntities(transactions: Transaction[]): TransactionResponseDto[] {
    return transactions.map((t) => new TransactionResponseDto(t));
  }
}
