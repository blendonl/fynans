import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

export interface StoreItemProps {
  id: string;
  storeId: string;
  name: string;
  price: Decimal;
  isDiscounted: boolean;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class StoreItem {
  private readonly props: StoreItemProps;

  constructor(props: StoreItemProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: StoreItemProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new Error('Store item ID is required');
    }

    if (!props.storeId || props.storeId.trim() === '') {
      throw new Error('Store ID is required');
    }

    if (!props.name || props.name.trim() === '') {
      throw new Error('Store item name is required');
    }

    if (!props.price || props.price.toNumber() < 0) {
      throw new Error('Store item price must be non-negative');
    }

    if (!props.createdAt) {
      throw new Error('Created date is required');
    }

    if (!props.updatedAt) {
      throw new Error('Updated date is required');
    }
  }

  get categoryId(): string {
    return this.props.categoryId;
  }

  get id(): string {
    return this.props.id;
  }

  get storeId(): string {
    return this.props.storeId;
  }

  get name(): string {
    return this.props.name;
  }

  get price(): Decimal {
    return this.props.price;
  }

  get isDiscounted(): boolean {
    return this.props.isDiscounted;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  getCurrentPrice(): Decimal {
    return this.props.price;
  }

  toJSON() {
    return {
      id: this.props.id,
      storeId: this.props.storeId,
      name: this.props.name,
      price: this.props.price.toNumber(),
      isDiscounted: this.props.isDiscounted,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
