import { TransactionScope } from '../../../transaction/core/domain/entities/transaction.entity';
export declare class QueryExpenseDto {
    categoryId?: string;
    storeId?: string;
    familyId?: string;
    scope?: TransactionScope;
    dateFrom?: string;
    dateTo?: string;
    valueMin?: number;
    valueMax?: number;
    page?: number;
    limit?: number;
}
