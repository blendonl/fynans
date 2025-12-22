import { type IIncomeRepository } from '../../domain/repositories/income.repository.interface';
import { Income } from '../../domain/entities/income.entity';
export declare class GetIncomeByTransactionIdUseCase {
    private readonly incomeRepository;
    constructor(incomeRepository: IIncomeRepository);
    execute(transactionId: string): Promise<Income>;
}
