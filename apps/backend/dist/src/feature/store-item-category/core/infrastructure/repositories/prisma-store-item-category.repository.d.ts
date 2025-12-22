import { PrismaService } from '../../../../../common/prisma/prisma.service';
import { IStoreItemCategoryRepository, PaginatedResult } from '../../domain/repositories/store-item-category.repository.interface';
import { StoreItemCategory } from '../../domain/entities/store-item-category.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';
export declare class PrismaStoreItemCategoryRepository implements IStoreItemCategoryRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Partial<StoreItemCategory>): Promise<StoreItemCategory>;
    findById(id: string): Promise<StoreItemCategory | null>;
    findAll(pagination?: Pagination): Promise<PaginatedResult<StoreItemCategory>>;
    findByParentId(parentId: string | null, pagination?: Pagination): Promise<PaginatedResult<StoreItemCategory>>;
    findChildren(parentId: string): Promise<StoreItemCategory[]>;
    update(id: string, data: Partial<StoreItemCategory>): Promise<StoreItemCategory>;
    delete(id: string): Promise<void>;
}
