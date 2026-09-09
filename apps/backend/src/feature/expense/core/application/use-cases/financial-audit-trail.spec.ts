import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { createPrismaServiceDouble } from '~test/prisma-service.double';
import { createRecordFinancialAuditDouble } from '~test/financial-audit.double';
import { firstCallArgument } from '~test/mock-call';
import { ApprovePendingExpenseUseCase } from './approve-pending-expense.use-case';
import { RejectPendingExpenseUseCase } from './reject-pending-expense.use-case';
import { DeleteExpenseUseCase } from './delete-expense.use-case';
import { AuditAction, AuditEntity } from '~common/audit';
import { TransactionStatus } from '../../../../transaction/core/domain/value-objects/transaction-status.vo';
import { TransactionType } from '../../../../transaction/core/domain/value-objects/transaction-type.vo';

interface AuditEntryShape {
  action: AuditAction;
  actorId: string;
  changes: Record<string, unknown>;
}

const OWNER = 'owner-1';
const APPROVER = 'admin-1';
const FAMILY = 'family-1';

function transactionWith(status: TransactionStatus) {
  return {
    id: 'transaction-1',
    userId: OWNER,
    familyId: FAMILY,
    paymentMethodId: null,
    type: TransactionType.EXPENSE,
    status,
    value: new Decimal('30'),
    isPending: () => status === TransactionStatus.PENDING,
  };
}

describe('financial mutations leave an audit trail', () => {
  let expenseRepository: Record<string, jest.Mock>;
  let transactionRepository: Record<string, jest.Mock>;
  let recordFinancialAudit: { execute: jest.Mock };

  const expenseWith = (status: TransactionStatus) => ({
    id: 'expense-1',
    transactionId: 'transaction-1',
    transaction: transactionWith(status),
  });

  beforeEach(() => {
    expenseRepository = {
      findById: jest
        .fn()
        .mockResolvedValue(expenseWith(TransactionStatus.CONFIRMED)),
      verifyOwnership: jest.fn().mockResolvedValue(true),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    transactionRepository = {
      delete: jest.fn().mockResolvedValue(undefined),
      updateStatus: jest
        .fn()
        .mockResolvedValue(transactionWith(TransactionStatus.CONFIRMED)),
    };
    recordFinancialAudit = createRecordFinancialAuditDouble();
  });

  it('records who deleted an expense', async () => {
    await new DeleteExpenseUseCase(
      expenseRepository as never,
      transactionRepository as never,
      createPrismaServiceDouble(),
      { recalculateBalance: jest.fn() } as never,
      { recalculateBalances: jest.fn() } as never,
      recordFinancialAudit as never,
    ).execute('expense-1', OWNER);

    expect(recordFinancialAudit.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        entity: AuditEntity.EXPENSE,
        entityId: 'expense-1',
        action: AuditAction.DELETED,
        actorId: OWNER,
        familyId: FAMILY,
      }),
    );
  });

  it('records who approved a pending expense', async () => {
    expenseRepository.findById.mockResolvedValue(
      expenseWith(TransactionStatus.PENDING),
    );

    await new ApprovePendingExpenseUseCase(
      expenseRepository as never,
      transactionRepository as never,
      { verifyApprovalAuthority: jest.fn() } as never,
      { updateBalancesAfterTransaction: jest.fn() } as never,
      { recalculateBalance: jest.fn() } as never,
      { notify: jest.fn() } as never,
      { execute: jest.fn() } as never,
      createPrismaServiceDouble(),
      recordFinancialAudit as never,
    ).execute('expense-1', APPROVER);

    const entry = firstCallArgument<AuditEntryShape>(
      recordFinancialAudit.execute,
    );

    expect(entry.action).toBe(AuditAction.APPROVED);
    expect(entry.actorId).toBe(APPROVER);
    expect(entry.changes.submittedBy).toBe(OWNER);
  });

  it('records who rejected a pending expense and why', async () => {
    expenseRepository.findById.mockResolvedValue(
      expenseWith(TransactionStatus.PENDING),
    );

    await new RejectPendingExpenseUseCase(
      expenseRepository as never,
      transactionRepository as never,
      { verifyApprovalAuthority: jest.fn() } as never,
      { execute: jest.fn() } as never,
      recordFinancialAudit as never,
    ).execute('expense-1', APPROVER, 'not a family expense');

    const entry = firstCallArgument<AuditEntryShape>(
      recordFinancialAudit.execute,
    );

    expect(entry.action).toBe(AuditAction.REJECTED);
    expect(entry.actorId).toBe(APPROVER);
    expect(entry.changes.rejectionReason).toBe('not a family expense');
  });
});
