import { type IIncomeCategoryRepository } from '../../domain/repositories/income-category.repository.interface';
import { UpdateIncomeCategoryDto } from '../dto/update-income-category.dto';
import { IncomeCategory } from '../../domain/entities/income-category.entity';
export declare class UpdateIncomeCategoryUseCase {
    private readonly incomeCategoryRepository;
    constructor(incomeCategoryRepository: IIncomeCategoryRepository);
    execute(id: string, dto: UpdateIncomeCategoryDto): Promise<IncomeCategory>;
    private validate;
    private checkCircularReference;
}
