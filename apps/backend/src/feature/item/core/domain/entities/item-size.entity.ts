import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

const VALID_UNITS = ['kg', 'g', 'l', 'ml', 'cl'] as const;
export type ItemSizeUnit = (typeof VALID_UNITS)[number];

export interface ItemSizeProps {
  id: string;
  itemId: string;
  value: Decimal;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ItemSize {
  private readonly props: ItemSizeProps;

  constructor(props: ItemSizeProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: ItemSizeProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new Error('ItemSize ID is required');
    }
    if (!props.itemId || props.itemId.trim() === '') {
      throw new Error('Item ID is required');
    }
    if (!props.value || props.value.toNumber() <= 0) {
      throw new Error('ItemSize value must be positive');
    }
    if (!VALID_UNITS.includes(props.unit as ItemSizeUnit)) {
      throw new Error(`ItemSize unit must be one of: ${VALID_UNITS.join(', ')}`);
    }
  }

  get id(): string {
    return this.props.id;
  }

  get itemId(): string {
    return this.props.itemId;
  }

  get value(): Decimal {
    return this.props.value;
  }

  get unit(): string {
    return this.props.unit;
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
      itemId: this.props.itemId,
      value: this.props.value.toNumber(),
      unit: this.props.unit,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
