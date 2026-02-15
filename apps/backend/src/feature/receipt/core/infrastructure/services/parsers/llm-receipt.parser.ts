import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  IReceiptParser,
  ReceiptParsingContext,
  ReceiptParsingResult,
} from '../../../application/services/receipt-parser.service';
import { IOllamaService } from '../../../application/interfaces/ollama.interface';
import { type UserReceiptContext } from '../../../application/use-cases/fetch-user-context.use-case';

interface LlmParsedItem {
  name: string;
  price: number;
  quantity?: number;
  suggestedItemCategory?: string;
  matchedExistingItem?: string;
}

interface LlmParsedReceipt {
  storeName?: string;
  storeLocation?: string;
  items?: LlmParsedItem[];
  totalAmount?: number;
  date?: string;
  time?: string;
  suggestedExpenseCategory?: string;
}

@Injectable()
export class LlmReceiptParser implements IReceiptParser {
  readonly name = 'llm';
  private readonly logger = new Logger(LlmReceiptParser.name);

  constructor(
    @Inject('OllamaService')
    private readonly ollamaService: IOllamaService,
  ) {}

  canParse(text: string): boolean {
    return text.length > 20;
  }

  async parse(
    text: string,
    context: ReceiptParsingContext,
  ): Promise<ReceiptParsingResult> {
    const isHealthy = await this.ollamaService.healthCheck();
    if (!isHealthy) {
      throw new Error('Ollama service is not available');
    }

    const tracker = context.progressTracker;

    // Phase 1: Parse + Match + Categorize
    tracker?.startStage('llm-parse');
    const parsePrompt = this.buildParsePrompt(text, context.userContext);
    const parseCompletion = await this.ollamaService.generateCompletion(
      parsePrompt,
      { onToken: tracker?.tokenCallback('llm-parse', 600) },
    );
    let parsed = this.extractJson(parseCompletion.response) as LlmParsedReceipt;
    this.validate(parsed);
    this.crossCheckTotal(parsed);
    tracker?.completeStage('llm-parse');

    // Phase 2: Normalize
    try {
      tracker?.startStage('llm-normalize');
      const normalizePrompt = this.buildNormalizePrompt(parsed);
      const normalizeCompletion = await this.ollamaService.generateCompletion(
        normalizePrompt,
        { onToken: tracker?.tokenCallback('llm-normalize', 500) },
      );
      const normalized = this.extractJson(
        normalizeCompletion.response,
      ) as LlmParsedReceipt;
      this.validate(normalized);
      parsed = normalized;
      tracker?.completeStage('llm-normalize');
    } catch (error) {
      this.logger.warn(
        `Normalization phase failed, using Phase 1 result: ${error instanceof Error ? error.message : error}`,
      );
      tracker?.completeStage('llm-normalize');
    }

    return {
      storeName: parsed.storeName || 'Unknown Store',
      storeLocation: parsed.storeLocation || '',
      items: (parsed.items || []).map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        suggestedItemCategory: item.suggestedItemCategory || undefined,
        matchedExistingItem: item.matchedExistingItem || undefined,
      })),
      totalAmount: parsed.totalAmount,
      date: parsed.date,
      time: parsed.time,
      recordedAt: this.parseDateTime(parsed.date, parsed.time),
      suggestedExpenseCategory: parsed.suggestedExpenseCategory || undefined,
      parserUsed: this.name,
    };
  }

  private buildParsePrompt(
    ocrText: string,
    userContext?: UserReceiptContext,
  ): string {
    let contextSection = '';

    if (userContext) {
      const itemsList = userContext.items
        .slice(0, 50)
        .map((i) => `${i.name} (${i.categoryName})`)
        .join(', ');

      const itemCatsList = userContext.itemCategories
        .map((c) => c.name)
        .join(', ');

      const expCatsList = userContext.expenseCategories
        .map((c) => `${c.name}${c.isConnectedToStore ? ' (store)' : ''}`)
        .join(', ');

      contextSection = `
User's existing items: ${itemsList || 'none'}
Item categories: ${itemCatsList || 'none'}
Expense categories: ${expCatsList || 'none'}

When matching items:
- If an OCR item name is similar to an existing item (e.g. "Mie11" matches "Miell"), set matchedExistingItem to the existing item's exact name
- For suggestedItemCategory, prefer existing categories listed above
- For suggestedExpenseCategory, pick the most appropriate expense category from the list above
`;
    }

    return `Extract structured data from this receipt OCR text. Return ONLY valid JSON, no other text.
${contextSection}
OCR Text:
${ocrText}

Return JSON with this exact structure:
{
  "storeName": "store name",
  "storeLocation": "store address or empty string",
  "items": [
    {
      "name": "item name (corrected if OCR error)",
      "price": 1.50,
      "quantity": 1,
      "suggestedItemCategory": "category name or null",
      "matchedExistingItem": "exact existing item name or null"
    }
  ],
  "totalAmount": 10.50,
  "date": "DD/MM/YYYY or null",
  "time": "HH:MM or null",
  "suggestedExpenseCategory": "expense category name or null"
}

Rules:
- prices must be positive numbers
- quantity defaults to 1 if not specified
- date format: DD/MM/YYYY
- time format: HH:MM (24h)
- if a field cannot be determined, use null
- correct obvious OCR errors in item names (e.g. "Mie11" → "Miell", "Qum3sht" → "Qumësht")
- do NOT include tax lines, subtotals, or promotional text as items
- matchedExistingItem should be the exact name of a matching existing item, or null if no match`;
  }

  private buildNormalizePrompt(parsed: LlmParsedReceipt): string {
    return `Review and normalize this parsed receipt data. Return ONLY valid JSON, no other text.

Input:
${JSON.stringify(parsed, null, 2)}

Tasks:
1. Fix any remaining item name typos or OCR artifacts
2. Remove junk items (tax lines, subtotals, promotional text, discount lines that were incorrectly parsed as items)
3. Correct obviously wrong prices (e.g. negative prices, prices that are clearly misread)
4. Ensure quantities are positive integers
5. Validate that categories make sense for the items
6. Keep the same JSON structure as the input

Return the cleaned JSON with the same structure.`;
  }

  private extractJson(response: string): Record<string, any> {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in LLM response');
    }

    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error('Failed to parse JSON from LLM response');
    }
  }

  private validate(parsed: Record<string, any>): void {
    if (parsed.items && Array.isArray(parsed.items)) {
      parsed.items = parsed.items.filter(
        (item: { name?: string; price?: number }) => {
          if (!item.name || item.name.length === 0) return false;
          if (typeof item.price !== 'number') return false;
          if (item.price <= 0 || item.price >= 100_000) return false;
          return true;
        },
      );
    }

    if (
      parsed.totalAmount !== null &&
      parsed.totalAmount !== undefined &&
      (parsed.totalAmount <= 0 || parsed.totalAmount >= 100_000)
    ) {
      parsed.totalAmount = undefined;
    }
  }

  private crossCheckTotal(parsed: Record<string, any>): void {
    if (!parsed.totalAmount || !parsed.items?.length) return;

    const itemsSum = parsed.items.reduce(
      (sum: number, item: { price: number; quantity?: number }) =>
        sum + item.price * (item.quantity || 1),
      0,
    );

    const difference = Math.abs(itemsSum - parsed.totalAmount);
    const threshold = parsed.totalAmount * 0.1;

    if (difference > threshold) {
      this.logger.warn(
        `Items total (${itemsSum.toFixed(2)}) differs from receipt total (${parsed.totalAmount}) by more than 10%`,
      );
    }
  }

  private parseDateTime(
    date?: string | null,
    time?: string | null,
  ): Date | undefined {
    if (!date) return undefined;

    const dateMatch = date.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!dateMatch) return undefined;

    const [, day, month, year] = dateMatch;
    let isoString = `${year}-${month}-${day}`;

    if (time) {
      const timeMatch = time.match(/(\d{2}):(\d{2})/);
      if (timeMatch) {
        isoString += `T${timeMatch[1]}:${timeMatch[2]}:00`;
      }
    }

    const parsed = new Date(isoString);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }
}
