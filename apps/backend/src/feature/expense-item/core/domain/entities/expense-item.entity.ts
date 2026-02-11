import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

export interface ExpenseItemProps {
  id: string;
  itemId: string;
  itemName: string;
  expenseId: string;
  categoryId: string;
  price: Decimal;
  discount: Decimal;
  quantity: Decimal;
  createdAt: Date;
  updatedAt: Date;
}

export class ExpenseItem {
  private readonly props: ExpenseItemProps;

  constructor(props: ExpenseItemProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: ExpenseItemProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new Error('Expense item ID is required');
    }

    if (!props.itemId || props.itemId.trim() === '') {
      throw new Error('Item ID is required');
    }

    if (!props.itemName || props.itemName.trim() === '') {
      throw new Error('Item name is required');
    }

    if (!props.expenseId || props.expenseId.trim() === '') {
      throw new Error('Expense ID is required');
    }

    if (!props.categoryId || props.categoryId.trim() === '') {
      throw new Error('Category ID is required');
    }

    if (!props.price || props.price.toNumber() < 0) {
      throw new Error('Price must be non-negative');
    }

    if (!props.discount || props.discount.toNumber() < 0) {
      throw new Error('Discount must be non-negative');
    }

    if (!props.quantity || props.quantity.toNumber() < 1) {
      throw new Error('Quantity must be at least 1');
    }

    if (props.discount.toNumber() > props.price.toNumber()) {
      throw new Error('Discount cannot exceed price');
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

  get itemId(): string {
    return this.props.itemId;
  }

  get itemName(): string {
    return this.props.itemName;
  }

  get expenseId(): string {
    return this.props.expenseId;
  }

  get categoryId(): string {
    return this.props.categoryId;
  }

  get price(): Decimal {
    return this.props.price;
  }

  get discount(): Decimal {
    return this.props.discount;
  }

  get quantity(): Decimal {
    return this.props.quantity;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  getFinalPrice(): Decimal {
    return this.props.price.minus(this.props.discount).times(this.props.quantity);
  }

  getDiscountPercentage(): number {
    if (this.props.price.toNumber() === 0) {
      return 0;
    }
    return (this.props.discount.toNumber() / this.props.price.toNumber()) * 100;
  }

  toJSON() {
    return {
      id: this.props.id,
      itemId: this.props.itemId,
      itemName: this.props.itemName,
      expenseId: this.props.expenseId,
      categoryId: this.props.categoryId,
      price: this.props.price.toNumber(),
      discount: this.props.discount.toNumber(),
      quantity: this.props.quantity.toNumber(),
      finalPrice: this.getFinalPrice().toNumber(),
      discountPercentage: this.getDiscountPercentage(),
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
