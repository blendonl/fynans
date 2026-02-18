export interface BasketItemProps {
  id: string;
  basketId: string;
  name: string;
  quantity: number;
  price: number | null;
  categoryId: string | null;
  categoryName?: string | null;
  notes: string | null;
  addedBy: string;
  addedByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class BasketItem {
  private readonly props: BasketItemProps;

  constructor(props: BasketItemProps) {
    this.props = props;
  }

  get id() { return this.props.id; }
  get basketId() { return this.props.basketId; }
  get name() { return this.props.name; }
  get quantity() { return this.props.quantity; }
  get price() { return this.props.price; }
  get categoryId() { return this.props.categoryId; }
  get categoryName() { return this.props.categoryName ?? null; }
  get notes() { return this.props.notes; }
  get addedBy() { return this.props.addedBy; }
  get addedByName() { return this.props.addedByName; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  update(partial: Partial<Pick<BasketItemProps, 'price' | 'quantity' | 'categoryId'>>) {
    if (partial.price !== undefined) this.props.price = partial.price;
    if (partial.quantity !== undefined) this.props.quantity = partial.quantity;
    if (partial.categoryId !== undefined) this.props.categoryId = partial.categoryId;
  }

  toJSON() {
    return {
      id: this.props.id,
      basketId: this.props.basketId,
      name: this.props.name,
      quantity: this.props.quantity,
      price: this.props.price,
      categoryId: this.props.categoryId,
      categoryName: this.props.categoryName ?? null,
      notes: this.props.notes,
      addedBy: this.props.addedBy,
      addedByName: this.props.addedByName,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
