import { Store as PrismaStore } from 'prisma/generated/prisma/client';
import { Store } from '../../domain/entities/store.entity';

export class StoreMapper {
  static toDomain(prismaStore: PrismaStore): Store {
    return new Store({
      id: prismaStore.id,
      name: prismaStore.name,
      location: prismaStore.location,
      createdAt: prismaStore.createdAt,
      updatedAt: prismaStore.updatedAt,
    });
  }
}
