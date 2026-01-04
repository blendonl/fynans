import { CreateExpenseItemDto } from '../../../../expense-item/core/application/dto/create-expense-item.dto';
export declare class CreateExpenseDto {
    userId: string;
    categoryId: string;
    storeName: string;
    storeLocation: string;
    items: CreateExpenseItemDto[];
    familyId?: string;
    scope?: 'PERSONAL' | 'FAMILY';
    recordedAt?: Date;
    constructor(data: {
        userId: string;
        categoryId: string;
        storeName: string;
        storeLocation: string;
        items: CreateExpenseItemDto[];
        familyId?: string;
        recordedAt?: Date;
    });
}
