export class CreateIncomeDto {
  transactionId: string;
  categoryId: string;
  userId: string;
  description?: string;

  constructor(
    transactionId: string,
    categoryId: string,
    userId: string,
    description?: string,
  ) {
    this.transactionId = transactionId;
    this.categoryId = categoryId;
    this.userId = userId;
    this.description = description;
  }
}
