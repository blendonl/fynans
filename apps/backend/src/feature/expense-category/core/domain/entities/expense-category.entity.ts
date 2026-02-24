import { ExpenseCategory as PrismaExpenseCategory } from 'prisma/generated/prisma/client';

export interface ExpenseCategoryProps {
  id: string;
  parentId: string | null;
  name: string;
  isConnectedToStore: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ExpenseCategory {
  private readonly props: ExpenseCategoryProps;

  constructor(props: ExpenseCategoryProps) {
    this.validate(props);
    this.props = props;
  }

  static fromPrisma(data: PrismaExpenseCategory): ExpenseCategory {
    return new ExpenseCategory({
      id: data.id,
      parentId: data.parentId,
      name: data.name,
      isConnectedToStore: data.isConnectedToStore,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  private validate(props: ExpenseCategoryProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new Error('Expense category ID is required');
    }

    if (!props.name || props.name.trim() === '') {
      throw new Error('Expense category name is required');
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

  get parentId(): string | null {
    return this.props.parentId;
  }

  get name(): string {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get isConnectedToStore(): boolean {
    return this.props.isConnectedToStore;
  }

}
