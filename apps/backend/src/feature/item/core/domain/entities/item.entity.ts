import { ItemSize } from './item-size.entity';
import { DomainValidationException } from '~common/exceptions/domain.exceptions';

export interface ItemProps {
  id: string;
  categoryId: string;
  name: string;
  nameEn?: string;
  sizes?: ItemSize[];
  createdAt: Date;
  updatedAt: Date;
}

export class Item {
  private readonly props: ItemProps;

  constructor(props: ItemProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: ItemProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new DomainValidationException('Item ID is required');
    }

    if (!props.categoryId || props.categoryId.trim() === '') {
      throw new DomainValidationException('Item category ID is required');
    }

    if (!props.name || props.name.trim() === '') {
      throw new DomainValidationException('Item name is required');
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

  get categoryId(): string {
    return this.props.categoryId;
  }

  get name(): string {
    return this.props.name;
  }

  get nameEn(): string | undefined {
    return this.props.nameEn;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get sizes(): ItemSize[] | undefined {
    return this.props.sizes;
  }

  toJSON() {
    return {
      id: this.props.id,
      categoryId: this.props.categoryId,
      name: this.props.name,
      nameEn: this.props.nameEn,
      sizes: this.props.sizes?.map((s) => s.toJSON()),
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
