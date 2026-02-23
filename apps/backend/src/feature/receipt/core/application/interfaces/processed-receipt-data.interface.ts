export interface ProcessedReceiptData {
  storeName: string;
  storeLocation: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    suggestedItemCategory?: string;
    size?: { value: number; unit: string };
  }>;
  recordedAt?: Date;
  extractedText: string;
  confidence: number;
  suggestedExpenseCategory?: string;
  parserUsed?: string;
}
