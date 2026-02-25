import { Injectable, Inject } from '@nestjs/common';
import {
  DomainNotFoundException,
  DomainValidationException,
} from '~common/exceptions/domain.exceptions';
import { type IStoreItemRepository } from '../../domain/repositories/store-item.repository.interface';
import { UpdateStoreItemDto } from '../dto/update-store-item.dto';
import { StoreItem } from '../../domain/entities/store-item.entity';

@Injectable()
export class UpdateStoreItemUseCase {
  constructor(
    @Inject('StoreItemRepository')
    private readonly storeItemRepository: IStoreItemRepository,
  ) {}

  async execute(id: string, dto: UpdateStoreItemDto): Promise<StoreItem> {
    const existing = await this.storeItemRepository.findById(id);
    if (!existing) {
      throw new DomainNotFoundException('Store item not found');
    }

    if (dto.price !== undefined && dto.price < 0) {
      throw new DomainValidationException('Price must be non-negative');
    }

    return this.storeItemRepository.update(id, {
      price: dto.price,
      isDiscounted: dto.isDiscounted,
    } as Partial<StoreItem>);
  }
}
