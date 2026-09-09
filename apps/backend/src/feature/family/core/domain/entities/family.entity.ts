import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { DomainValidationException } from '~common/exceptions/domain.exceptions';

interface FamilyProps {
  id: string;
  name: string;
  balance: Decimal;
  createdAt: Date;
  updatedAt: Date;
}

export class Family {
  private readonly props: FamilyProps;

  constructor(props: FamilyProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: FamilyProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new DomainValidationException('Family ID is required');
    }

    if (!props.name || props.name.trim() === '') {
      throw new DomainValidationException('Family name is required');
    }

    if (props.name.length > 100) {
      throw new DomainValidationException(
        'Family name must be 100 characters or less',
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

  get name(): string {
    return this.props.name;
  }

  get balance(): Decimal {
    return this.props.balance;
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
      name: this.props.name,
      balance: this.props.balance,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
