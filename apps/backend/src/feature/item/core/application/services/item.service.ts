import { Injectable } from '@nestjs/common';
import { CreateItemUseCase } from '../use-cases/create-item.use-case';
import { GetItemByIdUseCase } from '../use-cases/get-item-by-id.use-case';
import { ListItemsUseCase } from '../use-cases/list-items.use-case';
import { FindItemByNameUseCase } from '../use-cases/find-item-by-name.use-case';
import { UpdateItemUseCase } from '../use-cases/update-item.use-case';
import { DeleteItemUseCase } from '../use-cases/delete-item.use-case';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { Item } from '../../domain/entities/item.entity';
import { PaginatedResult } from '../../domain/repositories/item.repository.interface';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';

@Injectable()
export class ItemService {
  constructor(
    private readonly createItemUseCase: CreateItemUseCase,
    private readonly getItemByIdUseCase: GetItemByIdUseCase,
    private readonly listItemsUseCase: ListItemsUseCase,
    private readonly findItemByNameUseCase: FindItemByNameUseCase,
    private readonly updateItemUseCase: UpdateItemUseCase,
    private readonly deleteItemUseCase: DeleteItemUseCase,
  ) {}

  async create(dto: CreateItemDto, userId: string): Promise<Item> {
    return this.createItemUseCase.execute(dto, userId);
  }

  async findById(id: string): Promise<Item> {
    return this.getItemByIdUseCase.execute(id);
  }

  async findAll(
    userId: string,
    categoryId?: string,
    filters?: { search?: string },
    pagination?: Pagination,
  ): Promise<PaginatedResult<Item>> {
    return this.listItemsUseCase.execute(userId, categoryId, filters, pagination);
  }

  async findByName(name: string): Promise<Item | null> {
    return this.findItemByNameUseCase.execute(name);
  }

  async update(id: string, dto: UpdateItemDto): Promise<Item> {
    return this.updateItemUseCase.execute(id, dto);
  }

  async delete(id: string): Promise<void> {
    return this.deleteItemUseCase.execute(id);
  }
}
