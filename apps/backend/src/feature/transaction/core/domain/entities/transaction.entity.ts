import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { TransactionType } from '../value-objects/transaction-type.vo';

export enum TransactionScope {
  PERSONAL = 'PERSONAL',
  FAMILY = 'FAMILY',
}

export interface TransactionUser {
  id: string;
  firstName: string;
  lastName: string;
}

export interface TransactionProps {
  id: string;
  userId: string;
  familyId?: string;
  scope: TransactionScope;
  type: TransactionType;
  value: Decimal;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  user: TransactionUser;
}

export class Transaction {
  private readonly props: TransactionProps;

  constructor(props: TransactionProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: TransactionProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new Error('Transaction ID is required');
    }

    if (!props.userId || props.userId.trim() === '') {
      throw new Error('User ID is required');
    }

    if (!props.type) {
      throw new Error('Transaction type is required');
    }

    if (!props.value || props.value.toNumber() <= 0) {
      throw new Error('Transaction value must be positive');
    }
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get familyId(): string | undefined {
    return this.props.familyId;
  }

  get scope(): TransactionScope {
    return this.props.scope;
  }

  get type(): TransactionType {
    return this.props.type;
  }

  get value(): Decimal {
    return this.props.value;
  }

  get recordedAt(): Date {
    return this.props.recordedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get user(): TransactionUser {
    return this.props.user;
  }

  isExpense(): boolean {
    return this.props.type === TransactionType.EXPENSE;
  }

  isIncome(): boolean {
    return this.props.type === TransactionType.INCOME;
  }

  isPersonal(): boolean {
    return this.props.scope === TransactionScope.PERSONAL;
  }

  isFamily(): boolean {
    return this.props.scope === TransactionScope.FAMILY;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      familyId: this.familyId,
      scope: this.scope,
      type: this.type,
      value: this.value.toNumber(),
      recordedAt: this.recordedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      user: this.user,
    };
  }
}
