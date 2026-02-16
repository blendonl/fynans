import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  IReceiptParser,
  ReceiptParsingContext,
  ReceiptParsingResult,
} from '../../../application/services/receipt-parser.service';
import { IOllamaService } from '../../../application/interfaces/ollama.interface';
import { type UserReceiptContext } from '../../../application/use-cases/fetch-user-context.use-case';
import { ReceiptPostProcessor } from '../receipt-post-processor';

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
    private readonly postProcessor: ReceiptPostProcessor,
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

    tracker?.startStage('llm-parse');
    const parsePrompt = this.buildParsePrompt(text, context.userContext);
    let processed = await this.attemptTextParse(parsePrompt, tracker);

    // Single retry if no items were extracted
    if (!processed.items.length) {
      this.logger.warn(
        'LLM parse returned no items, retrying with directive prompt',
      );
      const retryPrompt = `The previous attempt returned no items. Please try again, reading the receipt more carefully. ${parsePrompt}`;
      const retryResult = await this.attemptTextParse(retryPrompt, undefined);
      if (retryResult.items.length) {
        processed = retryResult;
      }
    }

    tracker?.completeStage('llm-parse');

    return {
      storeName: processed.storeName,
      storeLocation: processed.storeLocation,
      items: processed.items,
      totalAmount: processed.totalAmount,
      date: processed.date,
      time: processed.time,
      recordedAt: this.parseDateTime(processed.date, processed.time),
      suggestedExpenseCategory: processed.suggestedExpenseCategory,
      parserUsed: this.name,
    };
  }

  private async attemptTextParse(
    prompt: string,
    tracker?: ReceiptParsingContext['progressTracker'],
  ) {
    const completion = await this.ollamaService.generateCompletion(prompt, {
      onToken: tracker?.tokenCallback('llm-parse', 600),
      format: 'json',
    });
    const parsed = this.extractJson(completion.response) as LlmParsedReceipt;
    return this.postProcessor.process(parsed);
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

      contextSection = `
User's existing items: ${itemsList || 'none'}

When matching items:
- If an OCR item name is similar to an existing item (e.g. "Mie11" matches "Miell"), set matchedExistingItem to the existing item's exact name
`;
    }

    return `Extract structured data from this receipt OCR text. Return ONLY valid JSON.

CONTEXT:
- This is a Kosovo store receipt. Prices are in Euro (EUR).
- Text is in Albanian. Common characters: ë, ç. Digraphs: sh, zh, gj, nj.
- Common OCR errors: "1" ↔ "l" ↔ "I", "0" ↔ "O", "3" ↔ "ë", "5" ↔ "S"
- Common receipt words: TOTALI (total), TVSH (VAT/tax), ARTIKUJT (articles), FATURË (invoice), KLIENT (client), KOPJE (copy).
${contextSection}
EXAMPLE OCR TEXT:
AGNESA MARKET
Podujevë-Prishtinë
NR.FIS: 601234567
MIELL 1KG         1.20
QUM3SHT 1L        0.85
2 x BUKE          0.60
2.375 x 2.89      6.86
TVSH 18%          1.71
TOTALI NE EURO   9.51

EXAMPLE OUTPUT:
{
  "storeName": "Agnesa Market",
  "storeLocation": "Podujevë-Prishtinë",
  "items": [
    {"name": "Miell 1KG", "price": 1.20, "quantity": 1, "suggestedItemCategory": "Bakery", "matchedExistingItem": null},
    {"name": "Qumësht 1L", "price": 0.85, "quantity": 1, "suggestedItemCategory": "Dairy", "matchedExistingItem": null},
    {"name": "Bukë", "price": 0.60, "quantity": 2, "suggestedItemCategory": "Bakery", "matchedExistingItem": null},
    {"name": "Item (weight-based)", "price": 6.86, "quantity": 2.375, "suggestedItemCategory": "Produce", "matchedExistingItem": null}
  ],
  "totalAmount": 9.51,
  "date": null,
  "time": null,
  "suggestedExpenseCategory": "Groceries"
}

Note: TVSH (tax), TOTALI (total), subtotals, payment lines, KLIENT, ATK, NR SERIAL, KOPJE, FISK, VEPRIMI, MENYRA, PAGESES are NOT items.

---

Now extract from this OCR text:
${ocrText}

Return JSON with this structure:
{ "storeName", "storeLocation", "items": [{"name", "price", "quantity", "suggestedItemCategory", "matchedExistingItem"}], "totalAmount", "date" (DD/MM/YYYY or null), "time" (HH:MM or null), "suggestedExpenseCategory" }

Rules:
- Prices are in EUR (typically 0.20 to 50.00 for individual items)
- Quantity defaults to 1
- For weight-based items (e.g., "2.375 x 2.89"), set quantity to the weight and price to the line total
- Correct OCR errors (e.g., "Mie11" → "Miell", "Qum3sht" → "Qumësht", "Buk3" → "Bukë")
- suggestedItemCategory is REQUIRED for every item
- suggestedExpenseCategory is REQUIRED`;
  }

  private extractJson(response: string): Record<string, any> {
    try {
      return JSON.parse(response) as Record<string, any>;
    } catch {
      // Fallback: try regex extraction for non-structured models
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in LLM response');
      return JSON.parse(jsonMatch[0]) as Record<string, any>;
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
