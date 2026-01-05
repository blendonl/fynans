import { TransactionScope } from '../../../../transaction/core/domain/entities/transaction.entity';
export declare class ExpenseFilters {
    userId?: string;
    categoryId?: string;
    storeId?: string;
    familyId?: string;
    scope?: TransactionScope;
    dateFrom?: Date;
    dateTo?: Date;
    valueMin?: number;
    valueMax?: number;
    constructor(data: {
        userId?: string;
        categoryId?: string;
        storeId?: string;
        familyId?: string;
        scope?: TransactionScope;
        dateFrom?: Date;
        dateTo?: Date;
        valueMin?: number;
        valueMax?: number;
    });
}
