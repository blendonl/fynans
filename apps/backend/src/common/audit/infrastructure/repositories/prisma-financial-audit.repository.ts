import { Injectable } from '@nestjs/common';
import {
  AuditAction as PrismaAuditAction,
  AuditEntity as PrismaAuditEntity,
  Prisma,
} from 'prisma/generated/prisma/client';
import { PrismaService } from '~common/prisma/prisma.service';
import { AuditEntity } from '../../domain/audit-entity';
import { FinancialAuditEntry } from '../../domain/entities/financial-audit-entry.entity';
import {
  IFinancialAuditRepository,
  RecordAuditEntryData,
} from '../../domain/repositories/financial-audit.repository.interface';
import { FinancialAuditMapper } from '../mappers/financial-audit.mapper';

@Injectable()
export class PrismaFinancialAuditRepository implements IFinancialAuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async record(data: RecordAuditEntryData): Promise<void> {
    await this.prisma.db.financialAuditLog.create({
      data: {
        entity: data.entity as PrismaAuditEntity,
        entityId: data.entityId,
        action: data.action as PrismaAuditAction,
        actorId: data.actorId,
        transactionId: data.transactionId ?? null,
        familyId: data.familyId ?? null,
        changes: (data.changes ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      },
    });
  }

  async findForEntity(
    entity: AuditEntity,
    entityId: string,
  ): Promise<FinancialAuditEntry[]> {
    const logs = await this.prisma.db.financialAuditLog.findMany({
      where: { entity: entity as PrismaAuditEntity, entityId },
      orderBy: { createdAt: 'desc' },
    });

    return logs.map((log) => FinancialAuditMapper.toDomain(log));
  }
}
