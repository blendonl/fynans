import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { LinkReceiptToExpenseUseCase } from './link-receipt-to-expense.use-case';

const owner = 'owner-1';
const victim = 'victim-1';

describe('LinkReceiptToExpenseUseCase', () => {
  let receiptRepo: Record<string, jest.Mock>;
  let expenseRepo: Record<string, jest.Mock>;
  let useCase: LinkReceiptToExpenseUseCase;

  beforeEach(() => {
    receiptRepo = {
      findById: jest.fn().mockResolvedValue({ id: 'receipt-1', userId: owner }),
      verifyOwnership: jest
        .fn()
        .mockImplementation((_id: string, userId: string) =>
          Promise.resolve(userId === owner),
        ),
      update: jest
        .fn()
        .mockResolvedValue({ id: 'receipt-1', expenseId: 'expense-1' }),
    };
    expenseRepo = {
      findById: jest.fn().mockResolvedValue({ id: 'expense-1' }),
      verifyOwnership: jest
        .fn()
        .mockImplementation((expenseId: string, userId: string) =>
          Promise.resolve(expenseId === 'expense-1' && userId === owner),
        ),
    };
    useCase = new LinkReceiptToExpenseUseCase(
      receiptRepo as never,
      expenseRepo as never,
    );
  });

  it("rejects attaching your receipt to another user's expense", async () => {
    await expect(
      useCase.execute('receipt-1', 'victim-expense', owner),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(receiptRepo.update).not.toHaveBeenCalled();
  });

  it('404s on an expense that does not exist', async () => {
    expenseRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('receipt-1', 'missing-expense', owner),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(receiptRepo.update).not.toHaveBeenCalled();
  });

  it("still rejects another user's receipt", async () => {
    await expect(
      useCase.execute('receipt-1', 'expense-1', victim),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(receiptRepo.update).not.toHaveBeenCalled();
  });

  it('links when the caller owns both the receipt and the expense', async () => {
    await useCase.execute('receipt-1', 'expense-1', owner);

    expect(receiptRepo.update).toHaveBeenCalledWith('receipt-1', {
      expenseId: 'expense-1',
    });
  });
});
