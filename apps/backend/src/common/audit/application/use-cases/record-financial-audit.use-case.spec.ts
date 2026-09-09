import { Logger } from '@nestjs/common';
import { AuditAction } from '../../domain/audit-action';
import { AuditEntity } from '../../domain/audit-entity';
import { RecordFinancialAuditUseCase } from './record-financial-audit.use-case';

describe('RecordFinancialAuditUseCase', () => {
  const entry = {
    entity: AuditEntity.EXPENSE,
    entityId: 'expense-1',
    action: AuditAction.APPROVED,
    actorId: 'admin-1',
    transactionId: 'transaction-1',
    familyId: 'family-1',
  };

  it('writes the entry to the audit repository', async () => {
    const repository = { record: jest.fn().mockResolvedValue(undefined) };

    await new RecordFinancialAuditUseCase(repository as never).execute(entry);

    expect(repository.record).toHaveBeenCalledWith(entry);
  });

  it('never fails the financial mutation it is auditing', async () => {
    const repository = {
      record: jest.fn().mockRejectedValue(new Error('audit store is down')),
    };
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    await expect(
      new RecordFinancialAuditUseCase(repository as never).execute(entry),
    ).resolves.toBeUndefined();
  });
});
