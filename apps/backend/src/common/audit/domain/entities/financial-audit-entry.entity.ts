import { AuditAction } from '../audit-action';
import { AuditEntity } from '../audit-entity';

interface FinancialAuditEntryProps {
  id: string;
  entity: AuditEntity;
  entityId: string;
  action: AuditAction;
  actorId: string;
  transactionId: string | null;
  familyId: string | null;
  changes: Record<string, unknown> | null;
  createdAt: Date;
}

export class FinancialAuditEntry {
  private readonly props: FinancialAuditEntryProps;

  constructor(props: FinancialAuditEntryProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get entity(): AuditEntity {
    return this.props.entity;
  }

  get entityId(): string {
    return this.props.entityId;
  }

  get action(): AuditAction {
    return this.props.action;
  }

  get actorId(): string {
    return this.props.actorId;
  }

  get transactionId(): string | null {
    return this.props.transactionId;
  }

  get familyId(): string | null {
    return this.props.familyId;
  }

  get changes(): Record<string, unknown> | null {
    return this.props.changes;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
