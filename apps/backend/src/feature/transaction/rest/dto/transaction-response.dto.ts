import {
  Transaction,
  TransactionUser,
} from '../../core/domain/entities/transaction.entity';
import { TransactionType } from '../../core/domain/value-objects/transaction-type.vo';

export class TransactionResponseDto {
  id: string;
  userId: string;
  type: TransactionType;
  value: number;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  user: TransactionUser;

  constructor(transaction: Transaction) {
    this.id = transaction.id;
    this.userId = transaction.userId;
    this.type = transaction.type;
    this.value = transaction.value.toNumber();
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
