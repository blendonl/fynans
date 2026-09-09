import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { Item } from '~feature/item/core';
import { DomainValidationException } from '~common/exceptions/domain.exceptions';

interface StoreItemProps {
  id: string;
  storeId: string;
  itemId: string;
  price: Decimal;
  isDiscounted: boolean;
  item?: Item;
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
      throw new DomainValidationException('Store item ID is required');
    }

    if (!props.storeId || props.storeId.trim() === '') {
      throw new DomainValidationException('Store ID is required');
    }

    if (!props.itemId || props.itemId.trim() === '') {
      throw new DomainValidationException('Item ID is required');
    }

    if (!props.price || props.price.toNumber() < 0) {
      throw new DomainValidationException(
        'Store item price must be non-negative',
      );
    }

    if (!props.createdAt) {
      throw new DomainValidationException('Created date is required');
    }

    if (!props.updatedAt) {
      throw new DomainValidationException('Updated date is required');
    }
  }

  get id(): string {
    return this.props.id;
  }

  get storeId(): string {
    return this.props.storeId;
  }

  get itemId(): string {
    return this.props.itemId;
  }

  get item(): Item | undefined {
    return this.props.item;
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

  getDiscountPercentage(activeDiscount?: any): number {
    if (
      !this.props.isDiscounted ||
      !activeDiscount ||
      !activeDiscount.isActive()
    ) {
      return 0;
    }
    return (
      (activeDiscount.discount.toNumber() / this.props.price.toNumber()) * 100
    );
  }

  toJSON() {
    return {
      id: this.props.id,
      storeId: this.props.storeId,
      itemId: this.props.itemId,
      price: this.props.price.toNumber(),
      isDiscounted: this.props.isDiscounted,
      item: this.props.item?.toJSON(),
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
