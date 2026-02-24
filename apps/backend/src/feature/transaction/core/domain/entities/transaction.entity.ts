import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { Transaction as PrismaTransaction } from 'prisma/generated/prisma/client';
import { TransactionType } from '../value-objects/transaction-type.vo';
import { TransactionStatus } from '../value-objects/transaction-status.vo';

export enum TransactionScope {
  PERSONAL = 'PERSONAL',
  FAMILY = 'FAMILY',
}

export interface TransactionUser {
  id: string;
  firstName: string;
  lastName: string;
  image?: string | null;
}

export interface TransactionProps {
  id: string;
  userId: string;
  familyId?: string;
  scope: TransactionScope;
  type: TransactionType;
  status: TransactionStatus;
  value: Decimal;
  paymentMethodId?: string;
  rejectionReason?: string;
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

  get paymentMethodId(): string | undefined {
    return this.props.paymentMethodId;
  }

  get status(): TransactionStatus {
    return this.props.status;
  }

  get rejectionReason(): string | undefined {
    return this.props.rejectionReason;
  }

  get user(): TransactionUser {
    return this.props.user;
  }

  static fromPrisma(
    data: PrismaTransaction & {
      user: { id: string; firstName: string; lastName: string; name: string; image: string | null };
    },
  ): Transaction {
    const user: TransactionUser = {
      id: data.user.id,
      firstName:
        data.user.firstName.length > 0
          ? data.user.firstName
          : data.user.name.split(' ')[0],
      lastName:
        data.user.lastName.length > 0
          ? data.user.lastName
          : data.user.name.split(' ')[0],
      image: data.user.image,
    };

    return new Transaction({
      id: data.id,
      userId: data.userId,
      type: data.type as TransactionType,
      status: data.status as TransactionStatus,
      value: data.value as Decimal,
      familyId: data.familyId ?? undefined,
      paymentMethodId: data.paymentMethodId ?? undefined,
      rejectionReason: data.rejectionReason ?? undefined,
      scope: data.scope as any,
      recordedAt: data.recordedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      user,
    });
  }

  isPending(): boolean {
    return this.props.status === TransactionStatus.PENDING;
  }

  isRejected(): boolean {
    return this.props.status === TransactionStatus.REJECTED;
  }

  canBeModified(): boolean {
    return this.props.status === TransactionStatus.PENDING;
  }

  isIncome(): boolean {
    return this.props.type === TransactionType.INCOME;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      familyId: this.familyId,
      scope: this.scope,
      type: this.type,
      status: this.status,
      value: this.value.toNumber(),
      paymentMethodId: this.paymentMethodId,
      rejectionReason: this.rejectionReason,
      recordedAt: this.recordedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      user: this.user,
    };
  }
}
