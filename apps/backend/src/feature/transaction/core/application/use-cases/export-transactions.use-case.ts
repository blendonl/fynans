import { Inject, Injectable } from '@nestjs/common';
import { Pagination } from '~common/dto/pagination.dto';
import {
  csvDate,
  csvLine,
  csvLiteral,
  csvText,
} from '../../domain/services/csv-writer';
import {
  TRANSACTION_DETAIL_REPOSITORY,
  type ITransactionDetailRepository,
  type TransactionDetail,
} from '../../domain/repositories/transaction-detail.repository.interface';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionFilters } from '../dto/transaction-filters.dto';
import { ListTransactionsUseCase } from './list-transactions.use-case';

export const EXPORT_PAGE_SIZE = 100;

const COLUMNS = [
  'id',
  'recorded_at',
  'type',
  'status',
  'scope',
  'amount',
  'category',
  'description',
  'store',
  'payment_method',
  'recorded_by',
  'rejection_reason',
];

const EMPTY_DETAIL: TransactionDetail = {
  description: null,
  categoryName: null,
  storeName: null,
  paymentMethodName: null,
};

@Injectable()
export class ExportTransactionsUseCase {
  constructor(
    private readonly listTransactionsUseCase: ListTransactionsUseCase,
    @Inject(TRANSACTION_DETAIL_REPOSITORY)
    private readonly detailRepository: ITransactionDetailRepository,
  ) {}

  async *execute(filters: TransactionFilters): AsyncGenerator<string> {
    yield csvLine(COLUMNS);

    let page = 1;
    let exported = 0;

    for (;;) {
      const pagination = new Pagination(page, EXPORT_PAGE_SIZE);
      const result = await this.listTransactionsUseCase.execute(
        filters,
        pagination,
      );

      if (result.data.length === 0) {
        return;
      }

      const details = await this.detailRepository.findByTransactionIds(
        result.data.map((transaction) => transaction.id),
      );

      for (const transaction of result.data) {
        yield csvLine(
          this.toRow(transaction, details.get(transaction.id) ?? EMPTY_DETAIL),
        );
      }

      exported += result.data.length;

      if (exported >= result.total) {
        return;
      }

      page += 1;
    }
  }

  private toRow(transaction: Transaction, detail: TransactionDetail): string[] {
    return [
      csvLiteral(transaction.id),
      csvDate(transaction.recordedAt),
      csvLiteral(transaction.type),
      csvLiteral(transaction.status),
      csvLiteral(transaction.scope),
      csvLiteral(transaction.value.toFixed(2)),
      csvText(detail.categoryName),
      csvText(detail.description),
      csvText(detail.storeName),
      csvText(detail.paymentMethodName),
      csvText(
        `${transaction.user.firstName} ${transaction.user.lastName}`.trim(),
      ),
      csvText(transaction.rejectionReason),
    ];
  }
}
