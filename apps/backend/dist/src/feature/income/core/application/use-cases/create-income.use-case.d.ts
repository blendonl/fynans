import { type IIncomeRepository } from '../../domain/repositories/income.repository.interface';
import { type IIncomeCategoryRepository } from '../../../../income-category/core/domain/repositories/income-category.repository.interface';
import { type IFamilyRepository } from '../../../../family/core/domain/repositories/family.repository.interface';
import { TransactionService } from '../../../../transaction/core/application/services/transaction.service';
import { CreateNotificationUseCase } from '../../../../notification/core/application/use-cases/create-notification.use-case';
import { UserService } from '../../../../user/core/application/services/user.service';
import { CreateIncomeDto } from '../dto/create-income.dto';
import { Income } from '../../domain/entities/income.entity';
export declare class CreateIncomeUseCase {
    private readonly incomeRepository;
    private readonly incomeCategoryRepository;
    private readonly familyRepository;
    private readonly transactionService;
    private readonly createNotificationUseCase;
    private readonly userService;
    constructor(incomeRepository: IIncomeRepository, incomeCategoryRepository: IIncomeCategoryRepository, familyRepository: IFamilyRepository, transactionService: TransactionService, createNotificationUseCase: CreateNotificationUseCase, userService: UserService);
    execute(dto: CreateIncomeDto): Promise<Income>;
    private validate;
}
