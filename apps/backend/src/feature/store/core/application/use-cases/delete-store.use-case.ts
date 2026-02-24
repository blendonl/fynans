import { Injectable, Inject } from '@nestjs/common';
import {
  DomainNotFoundException,
  DomainValidationException,
} from '~common/exceptions/domain.exceptions';
import { type IStoreRepository } from '../../domain/repositories/store.repository.interface';
import { PrismaService } from '../../../../../common/prisma/prisma.service';

@Injectable()
export class DeleteStoreUseCase {
  constructor(
    @Inject('StoreRepository')
    private readonly storeRepository: IStoreRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(id: string): Promise<void> {
    const store = await this.storeRepository.findById(id);
    if (!store) {
      throw new DomainNotFoundException(`Store with ID ${id} not found`);
    }

    const storeItemCount = await this.prisma.storeItem.count({
      where: { storeId: id },
    });

    if (storeItemCount > 0) {
      throw new DomainValidationException(
        `Cannot delete store. It is referenced by ${storeItemCount} store item(s)`,
      );
    }

    const expenseCount = await this.prisma.expense.count({
      where: { storeId: id },
    });

    if (expenseCount > 0) {
      throw new DomainValidationException(
        `Cannot delete store. It is referenced by ${expenseCount} expense(s)`,
      );
    }

    await this.storeRepository.delete(id);
  }
}
