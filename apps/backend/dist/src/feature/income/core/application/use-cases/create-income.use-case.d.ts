import { type IIncomeRepository } from '../../domain/repositories/income.repository.interface';
import { type IIncomeCategoryRepository } from '../../../../income-category/core/domain/repositories/income-category.repository.interface';
import { CreateIncomeDto } from '../dto/create-income.dto';
import { Income } from '../../domain/entities/income.entity';
export declare class CreateIncomeUseCase {
    private readonly incomeRepository;
    private readonly incomeCategoryRepository;
    constructor(incomeRepository: IIncomeRepository, incomeCategoryRepository: IIncomeCategoryRepository);
    execute(dto: CreateIncomeDto): Promise<Income>;
    private validate;
}
