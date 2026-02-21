import { ApiProperty } from '@nestjs/swagger';
import { ExpenseCategory } from '../../core/domain/entities/expense-category.entity';

export class ExpenseCategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ nullable: true })
  parentId: string | null;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  isConnectedToStore: boolean;

  static fromEntity(category: ExpenseCategory): ExpenseCategoryResponseDto {
    const dto = new ExpenseCategoryResponseDto();
    dto.id = category.id;
    dto.parentId = category.parentId;
    dto.isConnectedToStore = category.isConnectedToStore;
    dto.name = category.name;
    dto.createdAt = category.createdAt;
    dto.updatedAt = category.updatedAt;
    return dto;
  }

  static fromEntities(
    categories: ExpenseCategory[],
  ): ExpenseCategoryResponseDto[] {
    return categories.map((category) => this.fromEntity(category));
  }
}
