import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { createPrismaServiceDouble } from '~test/prisma-service.double';
import { CreateExpenseUseCase } from './create-expense.use-case';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { CreateExpenseItemDto } from '../../../../expense-item/core/application/dto/create-expense-item.dto';
import { DomainValidationException } from '~common/exceptions/domain.exceptions';

const USER = 'user-1';
const CATEGORY = 'category-1';

describe('CreateExpenseUseCase', () => {
  let expenseRepository: Record<string, jest.Mock>;
  let expenseCategoryService: Record<string, jest.Mock>;
  let transactionService: Record<string, jest.Mock>;
  let storeService: Record<string, jest.Mock>;
  let expenseItemService: Record<string, jest.Mock>;
  let notifyFamilyMembersService: Record<string, jest.Mock>;
  let paymentMethodService: Record<string, jest.Mock>;
  let useCase: CreateExpenseUseCase;

  const itemised = () => [
    new CreateExpenseItemDto({
      expenseId: '',
      categoryId: 'item-category-1',
      itemName: 'Milk',
      itemPrice: 10,
      discount: 2,
      quantity: 3,
    }),
  ];

  const buildUseCase = () =>
    new CreateExpenseUseCase(
      expenseRepository as never,
      expenseCategoryService as never,
      transactionService as never,
      storeService as never,
      expenseItemService as never,
      notifyFamilyMembersService as never,
      paymentMethodService as never,
      createPrismaServiceDouble(),
    );

  beforeEach(() => {
    expenseRepository = {
      create: jest.fn().mockResolvedValue({ id: 'expense-1' }),
      findById: jest.fn().mockResolvedValue({ id: 'expense-1' }),
    };
    expenseCategoryService = {
      findById: jest.fn().mockResolvedValue({
        id: CATEGORY,
        name: 'Groceries',
        isConnectedToStore: true,
      }),
      linkToUser: jest.fn().mockResolvedValue(undefined),
    };
    transactionService = {
      create: jest.fn().mockResolvedValue({ id: 'transaction-1' }),
    };
    storeService = {
      resolveStore: jest.fn().mockResolvedValue({ id: 'store-1' }),
    };
    expenseItemService = { create: jest.fn().mockResolvedValue(undefined) };
    notifyFamilyMembersService = {
      notify: jest.fn().mockResolvedValue(undefined),
    };
    paymentMethodService = {
      recalculateBalance: jest.fn().mockResolvedValue(undefined),
    };
    useCase = buildUseCase();
  });

  it('stores (price - discount) * quantity as the transaction value', async () => {
    await useCase.execute(
      new CreateExpenseDto({
        userId: USER,
        categoryId: CATEGORY,
        items: itemised(),
      }),
    );

    const dto = transactionService.create.mock.calls[0][0];
    expect(dto.value.toString()).toBe('24');
  });

  it('creates the transaction, expense and items inside one database transaction', async () => {
    const prisma = createPrismaServiceDouble();
    const runInTransaction = jest.spyOn(prisma, 'runInTransaction');

    await new CreateExpenseUseCase(
      expenseRepository as never,
      expenseCategoryService as never,
      transactionService as never,
      storeService as never,
      expenseItemService as never,
      notifyFamilyMembersService as never,
      paymentMethodService as never,
      prisma,
    ).execute(
      new CreateExpenseDto({
        userId: USER,
        categoryId: CATEGORY,
        items: itemised(),
      }),
    );

    expect(runInTransaction).toHaveBeenCalledTimes(1);
    expect(transactionService.create).toHaveBeenCalled();
    expect(expenseRepository.create).toHaveBeenCalled();
    expect(expenseItemService.create).toHaveBeenCalledTimes(1);
  });

  it('persists every supplied item rather than dropping them', async () => {
    const items = [...itemised(), ...itemised()];

    await useCase.execute(
      new CreateExpenseDto({ userId: USER, categoryId: CATEGORY, items }),
    );

    expect(expenseItemService.create).toHaveBeenCalledTimes(2);
  });

  it('rejects itemised expenses that resolve to no store instead of dropping the items', async () => {
    expenseCategoryService.findById.mockResolvedValue({
      id: CATEGORY,
      name: 'Rent',
      isConnectedToStore: false,
    });
    storeService.resolveStore.mockResolvedValue(null);

    await expect(
      useCase.execute(
        new CreateExpenseDto({
          userId: USER,
          categoryId: CATEGORY,
          items: itemised(),
        }),
      ),
    ).rejects.toBeInstanceOf(DomainValidationException);

    expect(transactionService.create).not.toHaveBeenCalled();
    expect(expenseRepository.create).not.toHaveBeenCalled();
  });

  it('records a store-less category from the amount with no items', async () => {
    expenseCategoryService.findById.mockResolvedValue({
      id: CATEGORY,
      name: 'Rent',
      isConnectedToStore: false,
    });
    storeService.resolveStore.mockResolvedValue(null);

    await useCase.execute(
      new CreateExpenseDto({
        userId: USER,
        categoryId: CATEGORY,
        amount: new Decimal('450'),
      }),
    );

    const dto = transactionService.create.mock.calls[0][0];
    expect(dto.value.toString()).toBe('450');
    expect(expenseItemService.create).not.toHaveBeenCalled();
  });

  it('synthesises one item from the amount when a store resolves', async () => {
    await useCase.execute(
      new CreateExpenseDto({
        userId: USER,
        categoryId: CATEGORY,
        amount: new Decimal('12.5'),
        note: 'Kiosk run',
      }),
    );

    expect(expenseItemService.create).toHaveBeenCalledTimes(1);
    const itemDto = expenseItemService.create.mock.calls[0][0];
    expect(itemDto.itemName).toBe('Kiosk run');
    expect(itemDto.itemPrice).toBe(12.5);
  });

  it('treats an empty item list as a simple amount-only expense', async () => {
    await useCase.execute(
      new CreateExpenseDto({
        userId: USER,
        categoryId: CATEGORY,
        items: [],
        amount: new Decimal('19.99'),
      }),
    );

    const dto = transactionService.create.mock.calls[0][0];
    expect(dto.value.toString()).toBe('19.99');
  });

  it('requires either items or a positive amount', async () => {
    await expect(
      useCase.execute(
        new CreateExpenseDto({ userId: USER, categoryId: CATEGORY }),
      ),
    ).rejects.toBeInstanceOf(DomainValidationException);

    await expect(
      useCase.execute(
        new CreateExpenseDto({
          userId: USER,
          categoryId: CATEGORY,
          amount: new Decimal(0),
        }),
      ),
    ).rejects.toBeInstanceOf(DomainValidationException);
  });

  it('rejects a discount larger than the price', async () => {
    const items = [
      new CreateExpenseItemDto({
        expenseId: '',
        categoryId: 'item-category-1',
        itemName: 'Milk',
        itemPrice: 2,
        discount: 5,
      }),
    ];

    await expect(
      useCase.execute(
        new CreateExpenseDto({ userId: USER, categoryId: CATEGORY, items }),
      ),
    ).rejects.toBeInstanceOf(DomainValidationException);
  });

  it('notifies the family and recalculates the payment method after the commit', async () => {
    const prisma = createPrismaServiceDouble();
    const afterCommit = jest.spyOn(prisma, 'afterCommit');

    await new CreateExpenseUseCase(
      expenseRepository as never,
      expenseCategoryService as never,
      transactionService as never,
      storeService as never,
      expenseItemService as never,
      notifyFamilyMembersService as never,
      paymentMethodService as never,
      prisma,
    ).execute(
      new CreateExpenseDto({
        userId: USER,
        categoryId: CATEGORY,
        items: itemised(),
        familyId: 'family-1',
        paymentMethodId: 'payment-method-1',
      }),
    );

    expect(afterCommit).toHaveBeenCalledTimes(2);
    expect(notifyFamilyMembersService.notify).toHaveBeenCalled();
    expect(paymentMethodService.recalculateBalance).toHaveBeenCalledWith(
      'payment-method-1',
    );
  });
});
