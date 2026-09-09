import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { Pagination } from '~common/dto/pagination.dto';
import { callArguments } from '~test/mock-call';
import {
  Transaction,
  TransactionScope,
} from '../../domain/entities/transaction.entity';
import { TransactionStatus } from '../../domain/value-objects/transaction-status.vo';
import { TransactionType } from '../../domain/value-objects/transaction-type.vo';
import { TransactionDetail } from '../../domain/repositories/transaction-detail.repository.interface';
import { TransactionFilters } from '../dto/transaction-filters.dto';
import {
  EXPORT_PAGE_SIZE,
  ExportTransactionsUseCase,
} from './export-transactions.use-case';

const FILTERS = new TransactionFilters({ userId: 'user-1' });

function transactionOf(
  id: string,
  overrides: Partial<Record<string, unknown>> = {},
) {
  return new Transaction({
    id,
    userId: 'user-1',
    scope: TransactionScope.PERSONAL,
    type: TransactionType.EXPENSE,
    status: TransactionStatus.CONFIRMED,
    value: new Decimal('12.5'),
    recordedAt: new Date('2026-03-04T05:06:07.000Z'),
    createdAt: new Date('2026-03-04T05:06:07.000Z'),
    updatedAt: new Date('2026-03-04T05:06:07.000Z'),
    user: { id: 'user-1', firstName: 'Ada', lastName: 'Lovelace', image: null },
    ...overrides,
  });
}

function detailOf(
  overrides: Partial<TransactionDetail> = {},
): TransactionDetail {
  return {
    description: 'Weekly shop',
    categoryName: 'Groceries',
    storeName: 'Viva Fresh',
    paymentMethodName: 'Cash',
    ...overrides,
  };
}

function build(
  pages: Transaction[][],
  details: Map<string, TransactionDetail> = new Map(),
) {
  const total = pages.reduce((sum, page) => sum + page.length, 0);
  const execute = jest.fn();

  pages.forEach((page) => {
    execute.mockResolvedValueOnce({ data: page, total });
  });
  execute.mockResolvedValue({ data: [], total });

  const findByTransactionIds = jest.fn().mockResolvedValue(details);

  return {
    execute,
    findByTransactionIds,
    useCase: new ExportTransactionsUseCase({ execute } as never, {
      findByTransactionIds,
    }),
  };
}

async function collect(rows: AsyncGenerator<string>): Promise<string[]> {
  const lines: string[] = [];

  for await (const row of rows) {
    lines.push(row);
  }

  return lines;
}

describe('ExportTransactionsUseCase', () => {
  it('writes a header row even when the account has nothing to export', async () => {
    const { useCase } = build([[]]);

    const lines = await collect(useCase.execute(FILTERS));

    expect(lines).toEqual([
      'id,recorded_at,type,status,scope,amount,category,description,store,payment_method,recorded_by,rejection_reason\r\n',
    ]);
  });

  it('passes the caller scoping straight through to the listing use case', async () => {
    const { useCase, execute } = build([[transactionOf('t-1')]]);

    await collect(useCase.execute(FILTERS));

    expect(execute).toHaveBeenCalledWith(FILTERS, expect.any(Pagination));
  });

  it('writes one row per transaction with its detail columns', async () => {
    const { useCase } = build(
      [[transactionOf('t-1')]],
      new Map([['t-1', detailOf()]]),
    );

    const [, row] = await collect(useCase.execute(FILTERS));

    expect(row).toBe(
      't-1,2026-03-04T05:06:07.000Z,EXPENSE,CONFIRMED,PERSONAL,12.50,Groceries,Weekly shop,Viva Fresh,Cash,Ada Lovelace,\r\n',
    );
  });

  it('leaves detail columns empty when nothing is attached', async () => {
    const { useCase } = build([[transactionOf('t-1')]]);

    const [, row] = await collect(useCase.execute(FILTERS));

    expect(row).toBe(
      't-1,2026-03-04T05:06:07.000Z,EXPENSE,CONFIRMED,PERSONAL,12.50,,,,,Ada Lovelace,\r\n',
    );
  });

  it('escapes a description that would otherwise become a spreadsheet formula', async () => {
    const { useCase } = build(
      [[transactionOf('t-1')]],
      new Map([
        ['t-1', detailOf({ description: '=cmd|calc', storeName: 'Shop, Ltd' })],
      ]),
    );

    const [, row] = await collect(useCase.execute(FILTERS));

    expect(row).toContain(`,'=cmd|calc,"Shop, Ltd",`);
  });

  it('pages through the listing rather than loading everything at once', async () => {
    const firstPage = Array.from({ length: EXPORT_PAGE_SIZE }, (_, index) =>
      transactionOf(`t-${index}`),
    );
    const { useCase, execute } = build([firstPage, [transactionOf('t-last')]]);

    const lines = await collect(useCase.execute(FILTERS));

    expect(lines).toHaveLength(EXPORT_PAGE_SIZE + 2);
    expect(callArguments<TransactionFilters>(execute).length).toBe(2);
  });

  it('stops once it has read every row the listing reported', async () => {
    const { useCase, execute } = build([[transactionOf('t-1')]]);

    await collect(useCase.execute(FILTERS));

    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('only asks for the details of transactions the listing already returned', async () => {
    const { useCase, findByTransactionIds } = build([
      [transactionOf('t-1'), transactionOf('t-2')],
    ]);

    await collect(useCase.execute(FILTERS));

    expect(findByTransactionIds).toHaveBeenCalledWith(['t-1', 't-2']);
  });
});
