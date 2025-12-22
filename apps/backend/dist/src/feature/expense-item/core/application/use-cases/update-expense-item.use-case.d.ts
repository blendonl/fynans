import { type IExpenseItemRepository } from '../../domain/repositories/expense-item.repository.interface';
import { type IStoreItemCategoryRepository } from '../../../../store-item-category/core/domain/repositories/store-item-category.repository.interface';
import { UpdateExpenseItemDto } from '../dto/update-expense-item.dto';
import { ExpenseItem } from '../../domain/entities/expense-item.entity';
export declare class UpdateExpenseItemUseCase {
    private readonly expenseItemRepository;
    private readonly storeItemCategoryRepository;
    constructor(expenseItemRepository: IExpenseItemRepository, storeItemCategoryRepository: IStoreItemCategoryRepository);
    execute(id: string, dto: UpdateExpenseItemDto): Promise<ExpenseItem>;
    private validate;
}
