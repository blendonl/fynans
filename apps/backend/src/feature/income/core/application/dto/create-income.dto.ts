export class CreateIncomeDto {
  transactionId: string;
  storeId: string;
  categoryId: string;
  userId: string;

  constructor(
    transactionId: string,
    storeId: string,
    categoryId: string,
    userId: string,
  ) {
    this.transactionId = transactionId;
    this.storeId = storeId;
    this.categoryId = categoryId;
    this.userId = userId;
  }
}
