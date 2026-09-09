import { DomainValidationException } from '~common/exceptions/domain.exceptions';
interface StoreProps {
  id: string;
  name: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Store {
  private readonly props: StoreProps;

  constructor(props: StoreProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: StoreProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new DomainValidationException('Store ID is required');
    }

    if (!props.name || props.name.trim() === '') {
      throw new DomainValidationException('Store name is required');
    }

    if (!props.location || props.location.trim() === '') {
      throw new DomainValidationException('Store location is required');
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

  get location(): string {
    return this.props.location;
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
      location: this.props.location,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
