import { type IIncomeRepository } from '../../domain/repositories/income.repository.interface';
export declare class DeleteIncomeUseCase {
    private readonly incomeRepository;
    constructor(incomeRepository: IIncomeRepository);
    execute(id: string): Promise<void>;
}
