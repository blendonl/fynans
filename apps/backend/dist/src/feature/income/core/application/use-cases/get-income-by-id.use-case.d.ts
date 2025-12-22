import { type IIncomeRepository } from '../../domain/repositories/income.repository.interface';
import { Income } from '../../domain/entities/income.entity';
export declare class GetIncomeByIdUseCase {
    private readonly incomeRepository;
    constructor(incomeRepository: IIncomeRepository);
    execute(id: string): Promise<Income>;
}
