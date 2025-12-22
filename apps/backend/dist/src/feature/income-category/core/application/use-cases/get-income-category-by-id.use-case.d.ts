import { type IIncomeCategoryRepository } from '../../domain/repositories/income-category.repository.interface';
import { IncomeCategory } from '../../domain/entities/income-category.entity';
export declare class GetIncomeCategoryByIdUseCase {
    private readonly incomeCategoryRepository;
    constructor(incomeCategoryRepository: IIncomeCategoryRepository);
    execute(id: string): Promise<IncomeCategory>;
}
