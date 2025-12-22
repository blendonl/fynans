import { type IIncomeCategoryRepository } from '../../domain/repositories/income-category.repository.interface';
export declare class DeleteIncomeCategoryUseCase {
    private readonly incomeCategoryRepository;
    constructor(incomeCategoryRepository: IIncomeCategoryRepository);
    execute(id: string): Promise<void>;
    private validate;
}
