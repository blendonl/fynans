import { DomainValidationException } from '~common/exceptions/domain.exceptions';
interface IncomeCategoryProps {
  id: string;
  parentId: string | null;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class IncomeCategory {
  private readonly props: IncomeCategoryProps;

  constructor(props: IncomeCategoryProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: IncomeCategoryProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new DomainValidationException('Income category ID is required');
    }

    if (!props.name || props.name.trim() === '') {
      throw new DomainValidationException('Category name is required');
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

  toJSON() {
    return {
      id: this.props.id,
      parentId: this.props.parentId,
      name: this.props.name,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
