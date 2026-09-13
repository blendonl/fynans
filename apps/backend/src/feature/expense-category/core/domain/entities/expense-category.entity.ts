import { DomainValidationException } from '~common/exceptions/domain.exceptions';
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

  private validate(props: ExpenseCategoryProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new DomainValidationException('Expense category ID is required');
    }

    if (!props.name || props.name.trim() === '') {
      throw new DomainValidationException('Expense category name is required');
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
