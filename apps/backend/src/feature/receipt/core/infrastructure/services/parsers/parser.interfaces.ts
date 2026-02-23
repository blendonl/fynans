export interface ItemSize {
  value: number;
  unit: string;
}

export interface ParsedReceiptItem {
  name: string;
  price: number;
  quantity?: number;
  suggestedItemCategory?: string;
  size?: ItemSize;
}

export interface ParsedReceipt {
  storeName?: string;
  storeLocation?: string;
  items?: ParsedReceiptItem[];
  totalAmount?: number;
  date?: string;
  time?: string;
  suggestedExpenseCategory?: string;
}

export interface PostProcessedReceiptItem {
  name: string;
  price: number;
  quantity: number;
  suggestedItemCategory?: string;
  size?: ItemSize;
}

export interface PostProcessedReceipt {
  storeName: string;
  storeLocation: string;
  items: PostProcessedReceiptItem[];
  totalAmount?: number;
  date?: string;
  time?: string;
  suggestedExpenseCategory?: string;
}

export interface LlmJsonItemSize {
  value?: number;
  unit?: string;
}

export interface LlmJsonReceiptItem {
  name?: string;
  price?: number;
  quantity?: number;
  category?: string | null;
  size?: LlmJsonItemSize | null;
}

export interface LlmJsonReceipt {
  storeName?: string;
  storeLocation?: string;
  date?: string | null;
  time?: string | null;
  total?: number | null;
  expenseCategory?: string | null;
  items?: LlmJsonReceiptItem[];
}
