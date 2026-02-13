import { ExpenseCategory } from '~feature/expense-category/core';
import { Store } from '~feature/store/core';
import { Transaction } from '~feature/transaction/core';
import { ExpenseItem } from '~feature/expense-item/core/domain/entities/expense-item.entity';

export interface ExpenseProps {
  id: string;
  category: ExpenseCategory;
  transaction: Transaction;
  store: Store | null;
  transactionId: string;
  storeId: string | null;
  categoryId: string;
  items?: ExpenseItem[];
  createdAt: Date;
  updatedAt: Date;
}

export class Expense {
  private readonly props: ExpenseProps;

  constructor(props: ExpenseProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: ExpenseProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new Error('Expense ID is required');
    }

    if (!props.transactionId || props.transactionId.trim() === '') {
      throw new Error('Transaction ID is required');
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

  get storeId(): string | null {
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

  get store(): Store | null {
    return this.props.store;
  }

  get category(): ExpenseCategory {
    return this.props.category;
  }

  get transaction(): Transaction {
    return this.props.transaction;
  }

  get items(): ExpenseItem[] {
    return this.props.items || [];
  }

  toJSON() {
    return {
      id: this.props.id,
      transaction: this.props.transaction,
      transactionId: this.props.transactionId,
      category: this.props.category,
      storeId: this.props.storeId,
      store: this.props.store,
      categoryId: this.props.categoryId,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      items: this.items.map((item) => item.toJSON()),
    };
  }
}
