import { type IIncomeRepository } from '../../domain/repositories/income.repository.interface';
import { type IIncomeCategoryRepository } from '../../../../income-category/core/domain/repositories/income-category.repository.interface';
import { UpdateIncomeDto } from '../dto/update-income.dto';
import { Income } from '../../domain/entities/income.entity';
export declare class UpdateIncomeUseCase {
    private readonly incomeRepository;
    private readonly incomeCategoryRepository;
    constructor(incomeRepository: IIncomeRepository, incomeCategoryRepository: IIncomeCategoryRepository);
    execute(id: string, dto: UpdateIncomeDto): Promise<Income>;
    private validate;
}
