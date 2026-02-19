export class CreateStoreItemDto {
  storeId: string;
  name: string;
  price: number;
  categoryId: string;
  isDiscounted?: boolean;
  sizeValue?: number;
  sizeUnit?: string;

  constructor(
    storeId: string,
    name: string,
    price: number,
    categoryId: string,
    isDiscounted?: boolean,
    sizeValue?: number,
    sizeUnit?: string,
  ) {
    this.storeId = storeId;
    this.name = name;
    this.price = price;
    this.categoryId = categoryId;
    this.isDiscounted = isDiscounted ?? false;
    this.sizeValue = sizeValue;
    this.sizeUnit = sizeUnit;
  }
}
