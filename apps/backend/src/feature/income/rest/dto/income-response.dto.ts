import { Income } from '../../core/domain/entities/income.entity';
import { TransactionResponseDto } from '~feature/transaction/rest';
import { IncomeCategoryResponseDto } from '~feature/income-category/rest/dto/income-category-response.dto';

export class IncomeResponseDto {
  id: string;
  transactionId: string;
  storeId: string;
  categoryId: string;
  transaction?: TransactionResponseDto;
  category?: IncomeCategoryResponseDto;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(income: Income): IncomeResponseDto {
    const dto = new IncomeResponseDto();
    dto.id = income.id;
    dto.transactionId = income.transactionId;
    dto.storeId = income.storeId;
    dto.categoryId = income.categoryId;
    dto.transaction = income.transaction ? TransactionResponseDto.fromEntity(income.transaction) : undefined;
    dto.category = income.category ? IncomeCategoryResponseDto.fromEntity(income.category) : undefined;
    dto.createdAt = income.createdAt;
    dto.updatedAt = income.updatedAt;
    return dto;
  }

  static fromEntities(incomes: Income[]): IncomeResponseDto[] {
    return incomes.map((income) => this.fromEntity(income));
  }
}
