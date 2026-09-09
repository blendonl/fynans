import { FinancialAuditLog } from 'prisma/generated/prisma/client';
import { AuditAction } from '../../domain/audit-action';
import { AuditEntity } from '../../domain/audit-entity';
import { FinancialAuditEntry } from '../../domain/entities/financial-audit-entry.entity';

export class FinancialAuditMapper {
  static toDomain(log: FinancialAuditLog): FinancialAuditEntry {
    return new FinancialAuditEntry({
      id: log.id,
      entity: log.entity as AuditEntity,
      entityId: log.entityId,
      action: log.action as AuditAction,
      actorId: log.actorId,
      transactionId: log.transactionId,
      familyId: log.familyId,
      changes: (log.changes as Record<string, unknown> | null) ?? null,
      createdAt: log.createdAt,
    });
  }
}
