import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { PaymentMethodType } from '../value-objects/payment-method-type.enum';

export interface PaymentMethodProps {
  id: string;
  userId: string;
  name: string;
  type: PaymentMethodType;
  color: string;
  initialBalance: Decimal;
  currentBalance: Decimal;
  createdAt: Date;
  updatedAt: Date;
}

export class PaymentMethod {
  private readonly props: PaymentMethodProps;

  constructor(props: PaymentMethodProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: PaymentMethodProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new Error('Payment method ID is required');
    }

    if (!props.userId || props.userId.trim() === '') {
      throw new Error('User ID is required');
    }

    if (!props.name || props.name.trim() === '') {
      throw new Error('Payment method name is required');
    }

    if (!props.type) {
      throw new Error('Payment method type is required');
    }

    if (!props.color || props.color.trim() === '') {
      throw new Error('Payment method color is required');
    }

    if (!props.createdAt) {
      throw new Error('Created date is required');
    }

    if (!props.updatedAt) {
      throw new Error('Updated date is required');
    }
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get name(): string {
    return this.props.name;
  }

  get type(): PaymentMethodType {
    return this.props.type;
  }

  get color(): string {
    return this.props.color;
  }

  get initialBalance(): Decimal {
    return this.props.initialBalance;
  }

  get currentBalance(): Decimal {
    return this.props.currentBalance;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toJSON() {
    return {
      id: this.props.id,
      userId: this.props.userId,
      name: this.props.name,
      type: this.props.type,
      color: this.props.color,
      initialBalance: this.props.initialBalance,
      currentBalance: this.props.currentBalance,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
