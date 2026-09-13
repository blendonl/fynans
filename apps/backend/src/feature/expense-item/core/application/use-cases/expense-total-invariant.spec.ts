import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { createPrismaServiceDouble } from '~test/prisma-service.double';
import { ExpenseTotalCalculator } from '../../domain/services/expense-total.calculator';
import { AddExpenseItemUseCase } from './add-expense-item.use-case';
import { CreateExpenseItemUseCase } from './create-expense-item.use-case';
import { UpdateExpenseItemUseCase } from './update-expense-item.use-case';
import { DeleteExpenseItemUseCase } from './delete-expense-item.use-case';
import { SyncExpenseTotalUseCase } from './sync-expense-total.use-case';
import { CreateExpenseItemDto } from '../dto/create-expense-item.dto';
import { UpdateExpenseItemDto } from '../dto/update-expense-item.dto';

const EXPENSE = 'expense-1';
const TRANSACTION = 'transaction-1';
const FAMILY = 'family-1';
const PAYMENT_METHOD = 'payment-method-1';
const OWNER = 'owner-1';
const STORE = 'store-1';

interface StoredItem {
  id: string;
  expenseId: string;
  itemId: string;
  price: Decimal;
  discount: Decimal;
  quantity: Decimal;
}

class ExpenseBooks {
  private readonly items = new Map<string, StoredItem>();
  private sequence = 0;
  transactionValue = new Decimal(0);

  seed(
    price: string,
    discount: string,
    quantity: string,
    id = `item-${++this.sequence}`,
  ): StoredItem {
    const item = {
      id,
      expenseId: EXPENSE,
      itemId: `catalog-${id}`,
      price: new Decimal(price),
      discount: new Decimal(discount),
      quantity: new Decimal(quantity),
    };
    this.items.set(id, item);
    return item;
  }

  seedConsistent(...lines: [string, string, string][]): void {
    for (const [price, discount, quantity] of lines) {
      this.seed(price, discount, quantity);
    }
    this.transactionValue = this.sumOfItems();
  }

  create(data: Omit<StoredItem, 'id'>): StoredItem {
    const item = { ...data, id: `item-${++this.sequence}` };
    this.items.set(item.id, item);
    return item;
  }

  find(id: string): StoredItem | null {
    return this.items.get(id) ?? null;
  }

  update(id: string, data: Partial<StoredItem>): StoredItem {
    const defined = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    );
    const item = { ...this.items.get(id)!, ...defined };
    this.items.set(id, item);
    return item;
  }

  remove(id: string): void {
    this.items.delete(id);
  }

  sumOfItems(): Decimal {
    return ExpenseTotalCalculator.total([...this.items.values()]);
  }
}

describe('the stored transaction value equals the sum of the expense items', () => {
  let books: ExpenseBooks;
  let expenseItemRepository: Record<string, jest.Mock>;
  let transactionRepository: Record<string, jest.Mock>;
  let familyBalanceService: Record<string, jest.Mock>;
  let paymentMethodService: Record<string, jest.Mock>;
  let sync: SyncExpenseTotalUseCase;

  const expectInvariant = () => {
    expect(books.transactionValue.toString()).toBe(
      books.sumOfItems().toString(),
    );
  };

  beforeEach(() => {
    books = new ExpenseBooks();

    expenseItemRepository = {
      create: jest
        .fn()
        .mockImplementation((data: Omit<StoredItem, 'id'>) =>
          Promise.resolve(books.create(data)),
        ),
      findById: jest
        .fn()
        .mockImplementation((id: string) => Promise.resolve(books.find(id))),
      update: jest
        .fn()
        .mockImplementation((id: string, data: Partial<StoredItem>) =>
          Promise.resolve(books.update(id, data)),
        ),
      delete: jest.fn().mockImplementation((id: string) => {
        books.remove(id);
        return Promise.resolve(undefined);
      }),
      calculateExpenseTotal: jest
        .fn()
        .mockImplementation(() => Promise.resolve(books.sumOfItems())),
      findExpenseTransaction: jest.fn().mockImplementation(() =>
        Promise.resolve({
          id: TRANSACTION,
          value: books.transactionValue,
          familyId: FAMILY,
          paymentMethodId: PAYMENT_METHOD,
        }),
      ),
    };
    transactionRepository = {
      update: jest
        .fn()
        .mockImplementation((_id: string, data: { value: Decimal }) => {
          books.transactionValue = data.value;
          return Promise.resolve(undefined);
        }),
    };
    familyBalanceService = {
      recalculateBalances: jest.fn().mockResolvedValue(undefined),
    };
    paymentMethodService = {
      recalculateBalance: jest.fn().mockResolvedValue(undefined),
    };

    sync = new SyncExpenseTotalUseCase(
      expenseItemRepository as never,
      transactionRepository as never,
      familyBalanceService as never,
      paymentMethodService as never,
      createPrismaServiceDouble(),
    );
  });

  const addItem = () =>
    new AddExpenseItemUseCase(
      new CreateExpenseItemUseCase(
        expenseItemRepository as never,
        {
          findById: jest.fn().mockResolvedValue({ id: 'category-1' }),
          linkToUser: jest.fn().mockResolvedValue(undefined),
        } as never,
        {
          createOrFind: jest.fn().mockResolvedValue({ id: 'catalog-new' }),
          findById: jest.fn().mockResolvedValue({ id: 'catalog-new' }),
        } as never,
      ),
      sync,
      createPrismaServiceDouble(),
    );

  const updateItem = () =>
    new UpdateExpenseItemUseCase(
      expenseItemRepository as never,
      { findById: jest.fn().mockResolvedValue({ id: 'category-1' }) } as never,
      sync,
      createPrismaServiceDouble(),
    );

  const deleteItem = () =>
    new DeleteExpenseItemUseCase(
      expenseItemRepository as never,
      sync,
      createPrismaServiceDouble(),
    );

  const newItemDto = (
    itemPrice: number,
    discount?: number,
    quantity?: number,
  ) =>
    new CreateExpenseItemDto({
      expenseId: EXPENSE,
      categoryId: 'category-1',
      itemName: 'Coffee',
      itemPrice,
      discount,
      quantity,
    });

  it('holds on a freshly composed expense', () => {
    books.seedConsistent(['10', '2', '3'], ['5', '0', '2']);

    expectInvariant();
    expect(books.transactionValue.toString()).toBe('34');
  });

  it('holds after an item is added', async () => {
    books.seedConsistent(['10', '2', '3']);

    await addItem().execute(newItemDto(5, 0, 2), STORE, OWNER);

    expectInvariant();
    expect(books.transactionValue.toString()).toBe('34');
  });

  it('holds after a second item is added to an empty expense', async () => {
    await addItem().execute(newItemDto(1.99), STORE, OWNER);
    await addItem().execute(newItemDto(0.59, 0, 3.115), STORE, OWNER);

    expectInvariant();
    expect(books.transactionValue.toString()).toBe('3.82785');
  });

  it("holds after an item's price is updated", async () => {
    books.seedConsistent(['10', '2', '3'], ['5', '0', '2']);

    await updateItem().execute(
      'item-1',
      new UpdateExpenseItemDto({ price: 20 }),
    );

    expectInvariant();
    expect(books.transactionValue.toString()).toBe('64');
  });

  it("holds after an item's discount is updated", async () => {
    books.seedConsistent(['10', '2', '3']);

    await updateItem().execute(
      'item-1',
      new UpdateExpenseItemDto({ discount: 4 }),
    );

    expectInvariant();
    expect(books.transactionValue.toString()).toBe('18');
  });

  it('holds after a discount is cleared back to zero', async () => {
    books.seedConsistent(['10', '2', '3']);

    await updateItem().execute(
      'item-1',
      new UpdateExpenseItemDto({ discount: 0 }),
    );

    expectInvariant();
    expect(books.transactionValue.toString()).toBe('30');
  });

  it('holds after an item is deleted', async () => {
    books.seedConsistent(['10', '2', '3'], ['5', '0', '2']);

    await deleteItem().execute('item-2');

    expectInvariant();
    expect(books.transactionValue.toString()).toBe('24');
  });

  it('holds after the last item is deleted', async () => {
    books.seedConsistent(['10', '2', '3']);

    await deleteItem().execute('item-1');

    expectInvariant();
    expect(books.transactionValue.toString()).toBe('0');
  });

  it('holds across an add, update, delete sequence', async () => {
    books.seedConsistent(['10', '2', '3']);

    await addItem().execute(newItemDto(5, 0, 2), STORE, OWNER);
    expectInvariant();

    await updateItem().execute(
      'item-1',
      new UpdateExpenseItemDto({ price: 12, discount: 2 }),
    );
    expectInvariant();

    await deleteItem().execute('item-2');
    expectInvariant();

    expect(books.transactionValue.toString()).toBe('30');
  });

  it('keeps the balances that depend on the transaction value current', async () => {
    books.seedConsistent(['10', '2', '3']);

    await updateItem().execute(
      'item-1',
      new UpdateExpenseItemDto({ price: 20 }),
    );

    expect(familyBalanceService.recalculateBalances).toHaveBeenCalledWith(
      FAMILY,
    );
    expect(paymentMethodService.recalculateBalance).toHaveBeenCalledWith(
      PAYMENT_METHOD,
    );
  });

  it('leaves the value alone when a mutation does not change the sum', async () => {
    books.seedConsistent(['10', '2', '3']);

    await updateItem().execute(
      'item-1',
      new UpdateExpenseItemDto({ categoryId: 'category-2' }),
    );

    expectInvariant();
    expect(transactionRepository.update).not.toHaveBeenCalled();
    expect(familyBalanceService.recalculateBalances).not.toHaveBeenCalled();
  });

  it('would catch a mutation that skipped the recalculation', () => {
    books.seedConsistent(['10', '2', '3']);
    books.update('item-1', { price: new Decimal('20') });

    expect(() => expectInvariant()).toThrow();
  });
});
