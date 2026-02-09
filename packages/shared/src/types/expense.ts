export interface Category {
  id: string;
  name: string;
  isConnectedToStore?: boolean;
}

export interface ExpenseItem {
  name: string;
  price: number;
  discount: number;
  quantity: number;
  categoryId: string;
  fromReceipt?: boolean;
}

export interface CurrentItem {
  name: string;
  price: string;
  discount: string;
  quantity: string;
  categoryId: string;
  fromReceipt?: boolean;
}
