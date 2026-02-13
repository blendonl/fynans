import { Injectable, Inject } from '@nestjs/common';
import { type IStoreRepository } from '../../domain/repositories/store.repository.interface';
import { CreateStoreDto } from '../dto/create-store.dto';
import { Store } from '../../domain/entities/store.entity';

@Injectable()
export class CreateOrFindStoreUseCase {
  constructor(
    @Inject('StoreRepository')
    private readonly storeRepository: IStoreRepository,
  ) {}

  async execute(dto: CreateStoreDto, userId: string): Promise<Store> {
    const existingStore = await this.storeRepository.findByNameAndLocation(
      dto.name,
      dto.location,
    );

    if (existingStore) {
      await this.storeRepository.linkToUser(existingStore.id, userId);
      return existingStore;
    }

    const store = await this.storeRepository.create({
      name: dto.name,
      location: dto.location,
    } as Partial<Store>);

    await this.storeRepository.linkToUser(store.id, userId);

    return store;
  }
}
