import { Transaction } from '~feature/transaction/core';
import { IncomeCategory } from '~feature/income-category/core';

export interface IncomeProps {
  id: string;
  transactionId: string;
  storeId: string;
  categoryId: string;
  transaction?: Transaction;
  category?: IncomeCategory;
  createdAt: Date;
  updatedAt: Date;
}

export class Income {
  private readonly props: IncomeProps;

  constructor(props: IncomeProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: IncomeProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new Error('Income ID is required');
    }

    if (!props.transactionId || props.transactionId.trim() === '') {
      throw new Error('Transaction ID is required');
    }

    if (!props.storeId || props.storeId.trim() === '') {
      throw new Error('Store ID is required');
    }

    if (!props.categoryId || props.categoryId.trim() === '') {
      throw new Error('Category ID is required');
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

  get transactionId(): string {
    return this.props.transactionId;
  }

  get storeId(): string {
    return this.props.storeId;
  }

  get categoryId(): string {
    return this.props.categoryId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get transaction(): Transaction | undefined {
    return this.props.transaction;
  }

  get category(): IncomeCategory | undefined {
    return this.props.category;
  }

  toJSON() {
    return {
      id: this.props.id,
      transactionId: this.props.transactionId,
      storeId: this.props.storeId,
      categoryId: this.props.categoryId,
      transaction: this.props.transaction?.toJSON(),
      category: this.props.category?.toJSON(),
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
