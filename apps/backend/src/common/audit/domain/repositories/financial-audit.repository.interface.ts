import { AuditAction } from '../audit-action';
import { AuditEntity } from '../audit-entity';
import { FinancialAuditEntry } from '../entities/financial-audit-entry.entity';

export const FINANCIAL_AUDIT_REPOSITORY = 'FinancialAuditRepository';

export interface RecordAuditEntryData {
  entity: AuditEntity;
  entityId: string;
  action: AuditAction;
  actorId: string;
  transactionId?: string | null;
  familyId?: string | null;
  changes?: Record<string, unknown> | null;
}

export interface IFinancialAuditRepository {
  record(data: RecordAuditEntryData): Promise<void>;
  findForEntity(
    entity: AuditEntity,
    entityId: string,
  ): Promise<FinancialAuditEntry[]>;
}
