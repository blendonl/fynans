import { type UserReceiptContext } from '../use-cases/fetch-user-context.use-case';
import { type ProgressTracker } from './progress-tracker';

export interface ReceiptParsingContext {
  userId?: string;
  userContext?: UserReceiptContext;
  confidence: number;
  rawText: string;
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
    matchedExistingItem?: string;
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
  canParse(text: string): boolean;
  parse(
    text: string,
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
