import { Transaction } from '~feature/transaction/core';
import { IncomeCategory } from '~feature/income-category/core';
export interface IncomeProps {
    id: string;
    transactionId: string;
    storeId: string;
    categoryId: string;
    transaction?: Transaction;
    category?: IncomeCategory;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Income {
    private readonly props;
    constructor(props: IncomeProps);
    private validate;
    get id(): string;
    get transactionId(): string;
    get storeId(): string;
    get categoryId(): string;
    get createdAt(): Date;
    get updatedAt(): Date;
    get transaction(): Transaction | undefined;
    get category(): IncomeCategory | undefined;
    toJSON(): {
        id: string;
        transactionId: string;
        storeId: string;
        categoryId: string;
        transaction: {
            id: string;
            userId: string;
            familyId: string | undefined;
            scope: import("~feature/transaction/core").TransactionScope;
            type: import("~feature/transaction/core").TransactionType;
            value: number;
            recordedAt: Date;
            createdAt: Date;
            updatedAt: Date;
            user: import("~feature/transaction/core").TransactionUser;
        } | undefined;
        category: {
            id: string;
            parentId: string | null;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        } | undefined;
        createdAt: Date;
        updatedAt: Date;
    };
}
