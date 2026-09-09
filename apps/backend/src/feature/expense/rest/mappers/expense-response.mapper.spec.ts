import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { Pagination } from '~common/dto/pagination.dto';
import { ExpenseItem } from '~feature/expense-item/core/domain/entities/expense-item.entity';
import { ExpenseCategory } from '~feature/expense-category/core/domain/entities/expense-category.entity';
import { Store } from '~feature/store/core/domain/entities/store.entity';
import { Transaction } from '~feature/transaction/core/domain/entities/transaction.entity';
import { TransactionType } from '~feature/transaction/core/domain/value-objects/transaction-type.vo';
import { TransactionStatus } from '~feature/transaction/core/domain/value-objects/transaction-status.vo';
import { Expense } from '../../core/domain/entities/expense.entity';
import { ExpenseReceiptUrlResolver } from '../../core/application/services/expense-receipt-url.resolver';
import { ExpenseResponseMapper } from './expense-response.mapper';

const date = new Date('2026-02-01T00:00:00.000Z');

const item = (id: string, name: string): ExpenseItem =>
  new ExpenseItem({
    id,
    itemId: `store-item-${id}`,
    itemName: name,
    expenseId: 'expense-1',
    categoryId: 'item-cat-1',
    price: new Decimal(10),
    discount: new Decimal(0),
    quantity: new Decimal(1),
    createdAt: date,
    updatedAt: date,
  });

const expense = (
  id: string,
  items: ExpenseItem[],
  receipt: { id: string; storageKey: string } | null,
): Expense =>
  new Expense({
    id,
    transactionId: `tx-${id}`,
    transaction: new Transaction({
      id: `tx-${id}`,
      userId: 'user-1',
      scope: 'PERSONAL' as never,
      type: TransactionType.EXPENSE,
      status: TransactionStatus.CONFIRMED,
      value: new Decimal(10),
      recordedAt: date,
      createdAt: date,
      updatedAt: date,
      user: { id: 'user-1', firstName: 'Arben', lastName: 'Krasniqi' },
    }),
    store: new Store({
      id: 'store-1',
      name: 'Viva Fresh',
      location: 'Prishtinë',
      createdAt: date,
      updatedAt: date,
    }),
    storeId: 'store-1',
    categoryId: 'cat-1',
    category: new ExpenseCategory({
      id: 'cat-1',
      parentId: null,
      name: 'Ushqime',
      isConnectedToStore: false,
      createdAt: date,
      updatedAt: date,
    }),
    items,
    receipt,
    createdAt: date,
    updatedAt: date,
  });

describe('ExpenseResponseMapper', () => {
  let storage: { getPresignedDownloadUrl: jest.Mock };
  let mapper: ExpenseResponseMapper;

  beforeEach(() => {
    storage = { getPresignedDownloadUrl: jest.fn() };
    const resolver = new ExpenseReceiptUrlResolver(storage as never);
    jest.spyOn(resolver['logger'], 'warn').mockImplementation(() => undefined);
    mapper = new ExpenseResponseMapper(resolver);
  });

  describe('receipt images', () => {
    it('presigns the receipt storage key', async () => {
      storage.getPresignedDownloadUrl.mockResolvedValue('https://minio/signed');

      const dto = await mapper.toResponse(
        expense('e1', [], { id: 'r1', storageKey: 'receipts/r1.jpg' }),
      );

      expect(storage.getPresignedDownloadUrl).toHaveBeenCalledWith(
        'receipts/r1.jpg',
      );
      expect(dto.receiptImages).toEqual(['https://minio/signed']);
    });

    it('returns no images when the expense has no receipt', async () => {
      const dto = await mapper.toResponse(expense('e1', [], null));

      expect(storage.getPresignedDownloadUrl).not.toHaveBeenCalled();
      expect(dto.receiptImages).toEqual([]);
    });

    it('degrades to no images when storage is unavailable', async () => {
      storage.getPresignedDownloadUrl.mockRejectedValue(new Error('minio down'));

      const dto = await mapper.toResponse(
        expense('e1', [], { id: 'r1', storageKey: 'receipts/r1.jpg' }),
      );

      expect(dto.receiptImages).toEqual([]);
    });
  });

  describe('matched items', () => {
    const listed = () =>
      mapper.toPaginatedResponse(
        {
          data: [expense('e1', [item('i1', 'Qumësht'), item('i2', 'Bukë')], null)],
          total: 1,
        },
        new Pagination(1, 10),
        'qum',
      );

    it('matches item names case-insensitively on a substring', async () => {
      const result = await listed();

      expect(result.data[0].matchedItems?.map((i) => i.name)).toEqual([
        'Qumësht',
      ]);
    });

    it('leaves matchedItems unset when no search term is given', async () => {
      const result = await mapper.toPaginatedResponse(
        { data: [expense('e1', [item('i1', 'Qumësht')], null)], total: 1 },
        new Pagination(1, 10),
      );

      expect(result.data[0].matchedItems).toBeUndefined();
    });

    it('carries pagination through unchanged', async () => {
      const result = await listed();

      expect(result).toMatchObject({ total: 1, page: 1, limit: 10 });
    });
  });
});
