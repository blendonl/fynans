import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { Item } from '~feature/item/core';
import { ItemSize } from '~feature/item/core/domain/entities/item-size.entity';

export interface StoreItemProps {
  id: string;
  storeId: string;
  itemId: string;
  itemSizeId?: string;
  price: Decimal;
  isDiscounted: boolean;
  item?: Item;
  itemSize?: ItemSize;
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

    if (!props.itemId || props.itemId.trim() === '') {
      throw new Error('Item ID is required');
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

  get id(): string {
    return this.props.id;
  }

  get storeId(): string {
    return this.props.storeId;
  }

  get itemId(): string {
    return this.props.itemId;
  }

  get itemSizeId(): string | undefined {
    return this.props.itemSizeId;
  }

  get item(): Item | undefined {
    return this.props.item;
  }

  get itemSize(): ItemSize | undefined {
    return this.props.itemSize;
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

  getCurrentPrice(activeDiscount?: any): Decimal {
    if (!this.props.isDiscounted || !activeDiscount || !activeDiscount.isActive()) {
      return this.props.price;
    }
    return this.props.price.minus(activeDiscount.discount);
  }

  getDiscountPercentage(activeDiscount?: any): number {
    if (!this.props.isDiscounted || !activeDiscount || !activeDiscount.isActive()) {
      return 0;
    }
    return (activeDiscount.discount.toNumber() / this.props.price.toNumber()) * 100;
  }

  toJSON() {
    return {
      id: this.props.id,
      storeId: this.props.storeId,
      itemId: this.props.itemId,
      itemSizeId: this.props.itemSizeId,
      price: this.props.price.toNumber(),
      isDiscounted: this.props.isDiscounted,
      item: this.props.item?.toJSON(),
      itemSize: this.props.itemSize?.toJSON(),
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
