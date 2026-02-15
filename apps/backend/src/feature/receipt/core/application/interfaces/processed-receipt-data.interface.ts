export interface ProcessedReceiptData {
  storeName: string;
  storeLocation: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    suggestedItemCategory?: string;
    matchedExistingItem?: string;
  }>;
  recordedAt?: Date;
  extractedText: string;
  confidence: number;
  suggestedExpenseCategory?: string;
  parserUsed?: string;
}
