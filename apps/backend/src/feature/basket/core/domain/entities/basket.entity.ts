import { BasketItem } from './basket-item.entity';

export enum BasketScope {
  PERSONAL = 'PERSONAL',
  FAMILY = 'FAMILY',
}

export interface BasketProps {
  id: string;
  userId: string;
  familyId: string | null;
  familyName?: string;
  scope: BasketScope;
  items: BasketItem[];
  createdAt: Date;
  updatedAt: Date;
}

export class Basket {
  private readonly props: BasketProps;

  constructor(props: BasketProps) {
    this.props = props;
  }

  get id() { return this.props.id; }
  get userId() { return this.props.userId; }
  get familyId() { return this.props.familyId; }
  get familyName() { return this.props.familyName; }
  get scope() { return this.props.scope; }
  get items() { return this.props.items; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  toJSON() {
    return {
      id: this.props.id,
      userId: this.props.userId,
      familyId: this.props.familyId,
      familyName: this.props.familyName,
      scope: this.props.scope,
      items: this.props.items.map((item) => item.toJSON()),
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
