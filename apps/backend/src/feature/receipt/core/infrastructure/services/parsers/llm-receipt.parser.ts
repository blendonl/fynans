import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  IReceiptParser,
  ReceiptParsingContext,
  ReceiptParsingResult,
} from '../../../application/services/receipt-parser.service';
import { IOllamaService } from '../../../application/interfaces/ollama.interface';
import { ReceiptPostProcessor } from '../receipt-post-processor';
import { parseDateTime } from './receipt-parser.utils';

interface LlmParsedItem {
  name: string;
  nameEn?: string;
  price: number;
  quantity?: number;
  suggestedItemCategory?: string;
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
    const llmStart = Date.now();
    this.logger.debug(`OCR text for LLM (${text.length} chars):\n${text.substring(0, 3000)}`);
    const parsePrompt = this.buildParsePrompt(text);
    let processed = await this.attemptTextParse(parsePrompt, tracker);

    // Single retry if no items were extracted
    if (!processed.items.length) {
      this.logger.warn(
        'LLM parse returned no items, retrying with directive prompt',
      );
      const retryPrompt = `The previous attempt returned no items. Please try again, reading the receipt more carefully.\n\n${parsePrompt}`;
      const retryResult = await this.attemptTextParse(retryPrompt, undefined);
      if (retryResult.items.length) {
        processed = retryResult;
      }
    }

    this.logger.log(`LLM parsing completed in ${Date.now() - llmStart}ms`);
    tracker?.completeStage('llm-parse');

    return {
      storeName: processed.storeName,
      storeLocation: processed.storeLocation,
      items: processed.items,
      totalAmount: processed.totalAmount,
      date: processed.date,
      time: processed.time,
      recordedAt: parseDateTime(processed.date, processed.time),
      suggestedExpenseCategory: processed.suggestedExpenseCategory,
      parserUsed: this.name,
    };
  }

  private async attemptTextParse(
    prompt: string,
    tracker?: ReceiptParsingContext['progressTracker'],
  ) {
    const completion = await this.ollamaService.generateCompletion(prompt, {
      onToken: tracker?.tokenCallback('llm-parse', 400),
    });
    this.logger.debug(`LLM raw text: ${completion.response.substring(0, 2000)}`);
    const parsed = this.parsePlainText(completion.response);

    const withCategory = parsed.items?.filter((i) => i.suggestedItemCategory).length ?? 0;
    this.logger.log(
      `LLM raw response: store="${parsed.storeName}", items=${parsed.items?.length ?? 0}, ` +
      `withCategory=${withCategory}, total=${parsed.totalAmount}, date="${parsed.date ?? 'none'}", time="${parsed.time ?? 'none'}"`,
    );
    if (parsed.items?.length) {
      this.logger.debug(
        `LLM parsed items: ${JSON.stringify(parsed.items.map((i) => ({ name: i.name, nameEn: i.nameEn, price: i.price, qty: i.quantity, category: i.suggestedItemCategory })))}`,
      );
    }

    const processed = this.postProcessor.process(parsed);

    this.logger.log(
      `Post-processed: ${processed.items.length} items, sizes extracted: ${processed.items.filter((i) => i.size).length}`,
    );

    return processed;
  }

  private parsePlainText(text: string): LlmParsedReceipt {
    const result: LlmParsedReceipt = {};
    const lines = text.split('\n').map((l) => l.trim());

    let inItems = false;
    const items: LlmParsedItem[] = [];

    for (const line of lines) {
      if (!line) continue;

      if (line.startsWith('STORE:')) {
        result.storeName = line.slice(6).trim();
      } else if (line.startsWith('LOCATION:')) {
        result.storeLocation = line.slice(9).trim();
      } else if (line.startsWith('DATE:')) {
        result.date = line.slice(5).trim();
      } else if (line.startsWith('TIME:')) {
        result.time = line.slice(5).trim();
      } else if (line.startsWith('TOTAL:')) {
        result.totalAmount = parseFloat(
          line.slice(6).trim().replace(',', '.'),
        );
      } else if (line.startsWith('EXPENSE_CATEGORY:')) {
        result.suggestedExpenseCategory = line.slice(17).trim();
      } else if (/^ITEMS:?$/i.test(line)) {
        inItems = true;
      } else if (inItems && line.includes('|')) {
        const parts = line.split('|').map((p) => p.trim());
        if (parts.length < 3) continue;

        // Skip header rows like "name | nameEn | price | qty | category"
        if (/^(name|item)\b/i.test(parts[0])) continue;

        const price = parseFloat((parts[2] || '0').replace(',', '.'));
        const quantity = parseFloat((parts[3] || '1').replace(',', '.'));

        if (isNaN(price) || price <= 0) continue;

        items.push({
          name: parts[0] || '',
          nameEn: parts[1] || undefined,
          price,
          quantity: isNaN(quantity) || quantity <= 0 ? 1 : quantity,
          suggestedItemCategory: parts[4] || undefined,
        });
      }
    }

    result.items = items;

    if (!items.length) {
      this.logger.warn('Pipe-delimited parsing found no items, raw text may be malformed');
    }

    return result;
  }

  private buildParsePrompt(ocrText: string): string {
    return `Extract items from this Kosovo store receipt OCR text.

HOW TO READ RECEIPT LINES:
- Lines like "3.115 X 0.59" or "2,375 × 2,89" are QTY HEADERS: qty=first number, unit_price=second number.
  The NEXT line has the item NAME (e.g., "PEMEPERIME PLU4 1.84E"). Use that name, NOT the numbers.
- If a line has NO qty header before it, qty=1 and price is on the line itself.
- Glued prices: "184E"=1.84, "365E"=3.65, "064E"=0.64, "005E"=0.05
- "PLU" codes (PLU4, PLU21, PLU2) are produce/vegetable identifiers.
- "PEMEPERIME" = Vegetables/Produce (the word means produce in Albanian).
- "QESE PLASTIKE" / "Kese sherbimi" = plastic bag fee — valid item.

RULES:
1. Date = DD/MM/YYYY (European). Separators: / - or .
2. price = UNIT price (from qty header or from item line if no header). NEVER use the line total.
3. Fix OCR corruptions: "<"→"K", "1"→"l", "0"→"O", "8"→"&", "S"→"B" where obvious.
4. Skip: TOTALI, TVSH, tax, payment, KLIENT, ATK, ARTIKUJT, NR SERIAL, KOPJE, FISK, OPERATOR, VEPRIMI, MENYRA, PAGESES, SHITESI, LOGIN, NR REFERIMIT, KUPON, SERIK.

Categories: Dairy, Meat, Bakery, Grains & Flour, Beverages, Fruits, Vegetables, Cleaning Products, Snacks, Condiments, Household, Canned Goods, Sweets, Other

Output format — pipe-delimited, one item per line:
STORE: name
LOCATION: city
DATE: DD/MM/YYYY
TIME: HH:MM
TOTAL: amount
EXPENSE_CATEGORY: category
ITEMS:
item name | English name | unit price | qty | category

Example — given OCR lines:
3.115 X 0.59
PEMEPERIME PLU4 1.84E
FLUIDI COLA 2L 0.64E
2,375 x 2,89
Bukuk 1kg Meka 6,86E

Output:
ITEMS:
Pemeperime PLU4 | Vegetables PLU4 | 0.59 | 3.115 | Vegetables
Fluidi Cola 2L | Soda Cola 2L | 0.64 | 1 | Beverages
Bukuk 1kg Meka | Flour 1kg soft | 2.89 | 2.375 | Grains & Flour

---
OCR TEXT:
${ocrText}

Extract ALL items:`;
  }
}
