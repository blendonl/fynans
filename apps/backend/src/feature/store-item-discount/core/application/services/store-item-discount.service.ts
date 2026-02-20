import { Injectable } from '@nestjs/common';
import { CreateStoreItemDiscountUseCase } from '../use-cases/create-store-item-discount.use-case';
import { GetStoreItemDiscountByIdUseCase } from '../use-cases/get-store-item-discount-by-id.use-case';
import { ListStoreItemDiscountsUseCase } from '../use-cases/list-store-item-discounts.use-case';
import { GetActiveDiscountUseCase } from '../use-cases/get-active-discount.use-case';
import { UpdateStoreItemDiscountUseCase } from '../use-cases/update-store-item-discount.use-case';
import { EndDiscountUseCase } from '../use-cases/end-discount.use-case';
import { DeleteStoreItemDiscountUseCase } from '../use-cases/delete-store-item-discount.use-case';
import { CreateStoreItemDiscountDto } from '../dto/create-store-item-discount.dto';
import { UpdateStoreItemDiscountDto } from '../dto/update-store-item-discount.dto';
import { StoreItemDiscount } from '../../domain/entities/store-item-discount.entity';
import { PaginatedResult } from '../../domain/repositories/store-item-discount.repository.interface';
import { Pagination } from '~common/dto/pagination.dto';

@Injectable()
export class StoreItemDiscountService {
  constructor(
    private readonly createStoreItemDiscountUseCase: CreateStoreItemDiscountUseCase,
    private readonly getStoreItemDiscountByIdUseCase: GetStoreItemDiscountByIdUseCase,
    private readonly listStoreItemDiscountsUseCase: ListStoreItemDiscountsUseCase,
    private readonly getActiveDiscountUseCase: GetActiveDiscountUseCase,
    private readonly updateStoreItemDiscountUseCase: UpdateStoreItemDiscountUseCase,
    private readonly endDiscountUseCase: EndDiscountUseCase,
    private readonly deleteStoreItemDiscountUseCase: DeleteStoreItemDiscountUseCase,
  ) {}

  async create(
    dto: CreateStoreItemDiscountDto,
  ): Promise<StoreItemDiscount> {
    return this.createStoreItemDiscountUseCase.execute(dto);
  }

  async findById(id: string): Promise<StoreItemDiscount> {
    return this.getStoreItemDiscountByIdUseCase.execute(id);
  }

  async findByStoreItemId(
    storeItemId: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<StoreItemDiscount>> {
    return this.listStoreItemDiscountsUseCase.execute(storeItemId, pagination);
  }

  async findActive(storeItemId: string): Promise<StoreItemDiscount | null> {
    return this.getActiveDiscountUseCase.execute(storeItemId);
  }

  async update(
    id: string,
    dto: UpdateStoreItemDiscountDto,
  ): Promise<StoreItemDiscount> {
    return this.updateStoreItemDiscountUseCase.execute(id, dto);
  }

  async end(id: string): Promise<StoreItemDiscount> {
    return this.endDiscountUseCase.execute(id);
  }

  async delete(id: string): Promise<void> {
    return this.deleteStoreItemDiscountUseCase.execute(id);
  }
}
