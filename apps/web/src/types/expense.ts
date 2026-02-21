/** UI/form type for expense items (has fields like fromReceipt not in the API) */
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

/** Form state type for expense item editing (not an API response) */
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
