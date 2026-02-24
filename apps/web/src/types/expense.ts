export interface ExpenseItem {
  id?: string;
  name: string;
  price: number;
  discount: number;
  quantity: number;
  categoryId: string;
  fromReceipt?: boolean;
  size?: { value: number; unit: string };
}

export interface CurrentItem {
  name: string;
  price: string;
  discount: string;
  quantity: string;
  categoryId: string;
  fromReceipt?: boolean;
  sizeValue?: string;
  sizeUnit?: string;
}
