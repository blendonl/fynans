import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { TransactionType } from '../value-objects/transaction-type.vo';
export declare enum TransactionScope {
    PERSONAL = "PERSONAL",
    FAMILY = "FAMILY"
}
export interface TransactionUser {
    id: string;
    firstName: string;
    lastName: string;
}
export interface TransactionProps {
    id: string;
    userId: string;
    familyId?: string;
    scope: TransactionScope;
    type: TransactionType;
    value: Decimal;
    recordedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    user: TransactionUser;
}
export declare class Transaction {
    private readonly props;
    constructor(props: TransactionProps);
    private validate;
    get id(): string;
    get userId(): string;
    get familyId(): string | undefined;
    get scope(): TransactionScope;
    get type(): TransactionType;
    get value(): Decimal;
    get recordedAt(): Date;
    get createdAt(): Date;
    get updatedAt(): Date;
    get user(): TransactionUser;
    isExpense(): boolean;
    isIncome(): boolean;
    isPersonal(): boolean;
    isFamily(): boolean;
    toJSON(): {
        id: string;
        userId: string;
        familyId: string | undefined;
        scope: TransactionScope;
        type: TransactionType;
        value: number;
        recordedAt: Date;
        createdAt: Date;
        updatedAt: Date;
        user: TransactionUser;
    };
}
