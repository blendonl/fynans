import { type IExpenseRepository } from '../../domain/repositories/expense.repository.interface';
import { type IExpenseCategoryRepository } from '../../../../expense-category/core/domain/repositories/expense-category.repository.interface';
import { type IFamilyRepository } from '../../../../family/core/domain/repositories/family.repository.interface';
import { TransactionService } from '../../../../transaction/core/application/services/transaction.service';
import { StoreService } from '../../../../store/core/application/services/store.service';
import { ExpenseItemService } from '../../../../expense-item/core/application/services/expense-item.service';
import { CreateNotificationUseCase } from '../../../../notification/core/application/use-cases/create-notification.use-case';
import { UserService } from '../../../../user/core/application/services/user.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { Expense } from '../../domain/entities/expense.entity';
export declare class CreateExpenseUseCase {
    private readonly expenseRepository;
    private readonly expenseCategoryRepository;
    private readonly familyRepository;
    private readonly transactionService;
    private readonly storeService;
    private readonly expenseItemService;
    private readonly createNotificationUseCase;
    private readonly userService;
    constructor(expenseRepository: IExpenseRepository, expenseCategoryRepository: IExpenseCategoryRepository, familyRepository: IFamilyRepository, transactionService: TransactionService, storeService: StoreService, expenseItemService: ExpenseItemService, createNotificationUseCase: CreateNotificationUseCase, userService: UserService);
    execute(dto: CreateExpenseDto): Promise<Expense>;
    private validate;
}
