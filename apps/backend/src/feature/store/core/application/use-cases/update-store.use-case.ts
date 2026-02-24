import { Injectable, Inject } from '@nestjs/common';
import {
  DomainValidationException,
  DomainNotFoundException,
} from '~common/exceptions/domain.exceptions';
import { type IStoreRepository } from '../../domain/repositories/store.repository.interface';
import { UpdateStoreDto } from '../dto/update-store.dto';
import { Store } from '../../domain/entities/store.entity';

@Injectable()
export class UpdateStoreUseCase {
  constructor(
    @Inject('StoreRepository')
    private readonly storeRepository: IStoreRepository,
  ) {}

  async execute(id: string, dto: UpdateStoreDto): Promise<Store> {
    const existingStore = await this.storeRepository.findById(id);
    if (!existingStore) {
      throw new DomainNotFoundException(`Store with ID ${id} not found`);
    }

    this.validate(dto);

    const store = await this.storeRepository.update(id, {
      name: dto.name,
      location: dto.location,
    } as Partial<Store>);

    return store;
  }

  private validate(dto: UpdateStoreDto): void {
    if (dto.name !== undefined && dto.name.trim() === '') {
      throw new DomainValidationException('Store name cannot be empty');
    }

    if (dto.location !== undefined && dto.location.trim() === '') {
      throw new DomainValidationException('Store location cannot be empty');
    }
  }
}
