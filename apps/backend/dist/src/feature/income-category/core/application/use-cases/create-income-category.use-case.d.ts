import { type IIncomeCategoryRepository } from '../../domain/repositories/income-category.repository.interface';
import { CreateIncomeCategoryDto } from '../dto/create-income-category.dto';
import { IncomeCategory } from '../../domain/entities/income-category.entity';
export declare class CreateIncomeCategoryUseCase {
    private readonly incomeCategoryRepository;
    constructor(incomeCategoryRepository: IIncomeCategoryRepository);
    execute(dto: CreateIncomeCategoryDto): Promise<IncomeCategory>;
    private validate;
}
