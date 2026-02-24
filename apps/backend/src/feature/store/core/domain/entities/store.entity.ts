import { Store as PrismaStore } from 'prisma/generated/prisma/client';

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
      throw new Error('Store ID is required');
    }

    if (!props.name || props.name.trim() === '') {
      throw new Error('Store name is required');
    }

    if (!props.location || props.location.trim() === '') {
      throw new Error('Store location is required');
    }

    if (!props.createdAt) {
      throw new Error('Created date is required');
    }

    if (!props.updatedAt) {
      throw new Error('Updated date is required');
    }
  }

  static fromPrisma(data: PrismaStore): Store {
    return new Store({
      id: data.id,
      name: data.name,
      location: data.location,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
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
