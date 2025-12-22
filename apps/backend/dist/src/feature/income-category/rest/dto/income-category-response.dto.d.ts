import { IncomeCategory } from '../../core/domain/entities/income-category.entity';
export declare class IncomeCategoryResponseDto {
    id: string;
    parentId: string | null;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    static fromEntity(category: IncomeCategory): IncomeCategoryResponseDto;
    static fromEntities(categories: IncomeCategory[]): IncomeCategoryResponseDto[];
}
