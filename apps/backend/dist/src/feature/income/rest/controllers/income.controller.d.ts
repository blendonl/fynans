import { IncomeService } from '../../core/application/services/income.service';
import { CreateIncomeRequestDto } from '../dto/create-income-request.dto';
import { UpdateIncomeRequestDto } from '../dto/update-income-request.dto';
import { IncomeResponseDto } from '../dto/income-response.dto';
export declare class IncomeController {
    private readonly incomeService;
    constructor(incomeService: IncomeService);
    create(createDto: CreateIncomeRequestDto): Promise<IncomeResponseDto>;
    findAll(storeId?: string, page?: number, limit?: number): Promise<{
        data: IncomeResponseDto[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByTransactionId(transactionId: string): Promise<IncomeResponseDto>;
    findOne(id: string): Promise<IncomeResponseDto>;
    update(id: string, updateDto: UpdateIncomeRequestDto): Promise<IncomeResponseDto>;
    remove(id: string): Promise<void>;
}
