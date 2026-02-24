import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

export interface StoreItemDiscountProps {
  id: string;
  storeItemId: string;
  discount: Decimal;
  startedAt: Date;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class StoreItemDiscount {
  private readonly props: StoreItemDiscountProps;

  constructor(props: StoreItemDiscountProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: StoreItemDiscountProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new Error('Store item discount ID is required');
    }

    if (!props.storeItemId || props.storeItemId.trim() === '') {
      throw new Error('Store item ID is required');
    }

    if (!props.discount || props.discount.toNumber() <= 0) {
      throw new Error('Discount amount must be greater than 0');
    }

    if (!props.startedAt) {
      throw new Error('Start date is required');
    }

    if (props.endedAt && props.endedAt < props.startedAt) {
      throw new Error('End date must be after start date');
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

  get storeItemId(): string {
    return this.props.storeItemId;
  }

  get discount(): Decimal {
    return this.props.discount;
  }

  get startedAt(): Date {
    return this.props.startedAt;
  }

  get endedAt(): Date | null {
    return this.props.endedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isActive(): boolean {
    const now = new Date();
    return this.props.startedAt <= now && (this.props.endedAt === null || this.props.endedAt > now);
  }

  getDiscountPercentage(originalPrice: Decimal): number {
    if (!this.isActive() || originalPrice.toNumber() === 0) {
      return 0;
    }
    return (this.props.discount.toNumber() / originalPrice.toNumber()) * 100;
  }

  toJSON() {
    return {
      id: this.props.id,
      storeItemId: this.props.storeItemId,
      discount: this.props.discount.toNumber(),
      startedAt: this.props.startedAt,
      endedAt: this.props.endedAt,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      isActive: this.isActive(),
    };
  }
}
