import { IncomeCategoryService } from '../../core/application/services/income-category.service';
import { CreateIncomeCategoryRequestDto } from '../dto/create-income-category-request.dto';
import { UpdateIncomeCategoryRequestDto } from '../dto/update-income-category-request.dto';
import { IncomeCategoryResponseDto } from '../dto/income-category-response.dto';
export declare class IncomeCategoryController {
    private readonly incomeCategoryService;
    constructor(incomeCategoryService: IncomeCategoryService);
    create(createDto: CreateIncomeCategoryRequestDto): Promise<IncomeCategoryResponseDto>;
    findAll(parentId?: string, page?: number, limit?: number): Promise<{
        data: IncomeCategoryResponseDto[];
        total: number;
        page: number;
        limit: number;
    }>;
    getTree(): Promise<{
        category: IncomeCategoryResponseDto;
        children: any;
    }[]>;
    findOne(id: string): Promise<IncomeCategoryResponseDto>;
    update(id: string, updateDto: UpdateIncomeCategoryRequestDto): Promise<IncomeCategoryResponseDto>;
    remove(id: string): Promise<void>;
}
