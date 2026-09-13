import { RecordFinancialAuditUseCase } from '~common/audit';

export function createRecordFinancialAuditDouble(): RecordFinancialAuditUseCase & {
  execute: jest.Mock;
} {
  return {
    execute: jest.fn().mockResolvedValue(undefined),
  } as unknown as RecordFinancialAuditUseCase & { execute: jest.Mock };
}
