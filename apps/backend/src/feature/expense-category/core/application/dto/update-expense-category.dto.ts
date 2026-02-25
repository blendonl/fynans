export class UpdateExpenseCategoryDto {
  name?: string;
  parentId?: string | null;
  isConnectedToStore?: boolean;

  constructor(data: {
    name?: string;
    parentId?: string | null;
    isConnectedToStore?: boolean;
  }) {
    this.name = data.name;
    this.parentId = data.parentId;
    this.isConnectedToStore = data.isConnectedToStore;
  }
}
