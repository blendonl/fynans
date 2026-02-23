import { type ProgressTracker } from './progress-tracker';

export interface ReceiptParsingContext {
  userId?: string;
  confidence: number;
  rawText: string;
  imageBuffer?: Buffer;
  progressTracker?: ProgressTracker;
}

export interface ReceiptParsingResult {
  storeName: string;
  storeLocation: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    suggestedItemCategory?: string;
    size?: { value: number; unit: string };
  }>;
  totalAmount?: number;
  date?: string;
  time?: string;
  recordedAt?: Date;
  taxAmount?: number;
  suggestedExpenseCategory?: string;
  parserUsed: string;
}

export interface IReceiptParser {
  readonly name: string;
  parse(
    text: string,
    context: ReceiptParsingContext,
  ): Promise<ReceiptParsingResult>;
  parseFromImage?(
    imageBuffer: Buffer,
    context: ReceiptParsingContext,
  ): Promise<ReceiptParsingResult>;
}

export interface IReceiptParserService {
  parse(
    text: string,
    context: ReceiptParsingContext,
  ): Promise<ReceiptParsingResult>;
  registerParser(parser: IReceiptParser): void;
}
