import { type IIncomeCategoryRepository } from '../../domain/repositories/income-category.repository.interface';
import { IncomeCategory } from '../../domain/entities/income-category.entity';
export interface IncomeCategoryTree {
    category: IncomeCategory;
    children: IncomeCategoryTree[];
}
export declare class GetIncomeCategoryTreeUseCase {
    private readonly incomeCategoryRepository;
    constructor(incomeCategoryRepository: IIncomeCategoryRepository);
    execute(): Promise<IncomeCategoryTree[]>;
    private buildTree;
}
