import { Income } from '../../core/domain/entities/income.entity';
import { TransactionResponseDto } from '~feature/transaction/rest';
import { IncomeCategoryResponseDto } from '~feature/income-category/rest/dto/income-category-response.dto';
export declare class IncomeResponseDto {
    id: string;
    transactionId: string;
    storeId: string;
    categoryId: string;
    transaction?: TransactionResponseDto;
    category?: IncomeCategoryResponseDto;
    createdAt: Date;
    updatedAt: Date;
    static fromEntity(income: Income): IncomeResponseDto;
    static fromEntities(incomes: Income[]): IncomeResponseDto[];
}
