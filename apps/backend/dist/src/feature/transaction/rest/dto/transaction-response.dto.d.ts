import { Transaction, TransactionUser } from '../../core/domain/entities/transaction.entity';
import { TransactionType } from '../../core/domain/value-objects/transaction-type.vo';
export declare class TransactionResponseDto {
    id: string;
    userId: string;
    type: TransactionType;
    value: number;
    recordedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    user: TransactionUser;
    constructor(transaction: Transaction);
    static fromEntity(transaction: Transaction): TransactionResponseDto;
    static fromEntities(transactions: Transaction[]): TransactionResponseDto[];
}
