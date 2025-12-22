import { Income } from '../../core/domain/entities/income.entity';
export declare class IncomeResponseDto {
    id: string;
    transactionId: string;
    storeId: string;
    categoryId: string;
    createdAt: Date;
    updatedAt: Date;
    static fromEntity(income: Income): IncomeResponseDto;
    static fromEntities(incomes: Income[]): IncomeResponseDto[];
}
