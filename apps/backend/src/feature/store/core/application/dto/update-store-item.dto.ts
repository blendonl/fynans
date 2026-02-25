export class UpdateStoreItemDto {
  price?: number;
  isDiscounted?: boolean;

  constructor(data: { price?: number; isDiscounted?: boolean }) {
    this.price = data.price;
    this.isDiscounted = data.isDiscounted;
  }
}
