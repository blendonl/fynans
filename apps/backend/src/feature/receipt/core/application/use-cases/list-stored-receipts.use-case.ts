import { Inject, Injectable } from '@nestjs/common';
import { IStoredReceiptRepository, StoredReceiptFilters } from '../../domain/repositories/stored-receipt.repository.interface';
import { Pagination, PaginatedResult } from '~common/dto/pagination.dto';
import { StoredReceipt } from '../../domain/entities/stored-receipt.entity';

@Injectable()
export class ListStoredReceiptsUseCase {
  constructor(
    @Inject('StoredReceiptRepository')
    private readonly receiptRepo: IStoredReceiptRepository,
  ) {}

  async execute(
    filters: StoredReceiptFilters,
    pagination: Pagination,
  ): Promise<PaginatedResult<StoredReceipt>> {
    return this.receiptRepo.findAll(filters, pagination);
  }
}
