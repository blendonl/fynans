import { CreateIncomeCategoryUseCase } from '../use-cases/create-income-category.use-case';
import { GetIncomeCategoryByIdUseCase } from '../use-cases/get-income-category-by-id.use-case';
import { ListIncomeCategoriesUseCase } from '../use-cases/list-income-categories.use-case';
import { GetIncomeCategoryTreeUseCase, IncomeCategoryTree } from '../use-cases/get-income-category-tree.use-case';
import { UpdateIncomeCategoryUseCase } from '../use-cases/update-income-category.use-case';
import { DeleteIncomeCategoryUseCase } from '../use-cases/delete-income-category.use-case';
import { CreateIncomeCategoryDto } from '../dto/create-income-category.dto';
import { UpdateIncomeCategoryDto } from '../dto/update-income-category.dto';
import { IncomeCategory } from '../../domain/entities/income-category.entity';
import { PaginatedResult } from '../../domain/repositories/income-category.repository.interface';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';
export declare class IncomeCategoryService {
    private readonly createIncomeCategoryUseCase;
    private readonly getIncomeCategoryByIdUseCase;
    private readonly listIncomeCategoriesUseCase;
    private readonly getIncomeCategoryTreeUseCase;
    private readonly updateIncomeCategoryUseCase;
    private readonly deleteIncomeCategoryUseCase;
    constructor(createIncomeCategoryUseCase: CreateIncomeCategoryUseCase, getIncomeCategoryByIdUseCase: GetIncomeCategoryByIdUseCase, listIncomeCategoriesUseCase: ListIncomeCategoriesUseCase, getIncomeCategoryTreeUseCase: GetIncomeCategoryTreeUseCase, updateIncomeCategoryUseCase: UpdateIncomeCategoryUseCase, deleteIncomeCategoryUseCase: DeleteIncomeCategoryUseCase);
    create(dto: CreateIncomeCategoryDto): Promise<IncomeCategory>;
    findById(id: string): Promise<IncomeCategory>;
    findAll(parentId?: string | null, pagination?: Pagination): Promise<PaginatedResult<IncomeCategory>>;
    getTree(): Promise<IncomeCategoryTree[]>;
    update(id: string, dto: UpdateIncomeCategoryDto): Promise<IncomeCategory>;
    delete(id: string): Promise<void>;
}
