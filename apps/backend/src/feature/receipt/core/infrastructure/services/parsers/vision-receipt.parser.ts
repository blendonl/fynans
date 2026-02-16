import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  IReceiptParser,
  ReceiptParsingContext,
  ReceiptParsingResult,
} from '../../../application/services/receipt-parser.service';
import { IOllamaService } from '../../../application/interfaces/ollama.interface';
import { type UserReceiptContext } from '../../../application/use-cases/fetch-user-context.use-case';
import { ReceiptPostProcessor } from '../receipt-post-processor';
import sharp from 'sharp';

interface VisionParsedReceipt {
  storeName?: string;
  storeLocation?: string;
  items?: Array<{
    name: string;
    price: number;
    quantity?: number;
    suggestedItemCategory?: string;
    matchedExistingItem?: string;
  }>;
  totalAmount?: number;
  date?: string;
  time?: string;
  suggestedExpenseCategory?: string;
}

@Injectable()
export class VisionReceiptParser implements IReceiptParser {
  readonly name = 'vision-llm';
  private readonly logger = new Logger(VisionReceiptParser.name);

  constructor(
    @Inject('OllamaService')
    private readonly ollamaService: IOllamaService,
    private readonly postProcessor: ReceiptPostProcessor,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canParse(text: string): boolean {
    return true;
  }

  async parse(
    text: string,
    context: ReceiptParsingContext,
  ): Promise<ReceiptParsingResult> {
    if (!context.imageBuffer) {
      throw new Error('Vision parser requires an image buffer');
    }
    return this.parseFromImage(context.imageBuffer, context);
  }

  async parseFromImage(
    imageBuffer: Buffer,
    context: ReceiptParsingContext,
  ): Promise<ReceiptParsingResult> {
    const isHealthy = await this.ollamaService.healthCheck();
    if (!isHealthy) {
      throw new Error('Ollama service is not available');
    }

    const tracker = context.progressTracker;

    tracker?.startStage('vision-parse');

    // Resize image to max 1536px — 7B VLM benefits from higher resolution
    const resizedBuffer = await this.resizeImage(imageBuffer);
    const imageBase64 = resizedBuffer.toString('base64');

    const prompt = this.buildVisionPrompt(context.userContext);
    let processed = await this.attemptVisionParse(prompt, imageBase64, tracker);

    // Single retry if no items were extracted
    if (!processed.items.length) {
      this.logger.warn(
        'Vision parse returned no items, retrying with directive prompt',
      );
      const retryPrompt = `The previous attempt returned no items. Please try again, reading the receipt more carefully. ${prompt}`;
      const retryResult = await this.attemptVisionParse(
        retryPrompt,
        imageBase64,
        undefined,
      );
      if (retryResult.items.length) {
        processed = retryResult;
      }
    }

    tracker?.completeStage('vision-parse');

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

  private async attemptVisionParse(
    prompt: string,
    imageBase64: string,
    tracker?: ReceiptParsingContext['progressTracker'],
  ) {
    const completion = await this.ollamaService.generateCompletion(prompt, {
      onToken: tracker?.tokenCallback('vision-parse', 600),
      format: 'json',
      images: [imageBase64],
    });

    const parsed = this.extractJson(completion.response) as VisionParsedReceipt;
    return this.postProcessor.process(parsed);
  }

  private async resizeImage(imageBuffer: Buffer): Promise<Buffer> {
    const metadata = await sharp(imageBuffer).metadata();
    const { width, height } = metadata;

    if (!width || !height) return imageBuffer;

    const maxDim = 1536;
    if (width <= maxDim && height <= maxDim) return imageBuffer;

    const scale = Math.min(maxDim / width, maxDim / height);
    return sharp(imageBuffer)
      .resize(Math.round(width * scale), Math.round(height * scale))
      .jpeg({ quality: 92 })
      .toBuffer();
  }

  private buildVisionPrompt(userContext?: UserReceiptContext): string {
    let itemsSection = '';

    if (userContext) {
      const itemsList = userContext.items
        .slice(0, 50)
        .map((i) => `${i.name} (${i.categoryName})`)
        .join(', ');

      if (itemsList) {
        itemsSection = `\nUser's existing items for matching: ${itemsList}\n`;
      }
    }

    return `You are a receipt parser. Extract structured data from this receipt image.

CONTEXT:
- Receipts are from Kosovo stores. Prices are in Euro (EUR).
- Text is in Albanian. Common characters: ë, ç. Digraphs: sh, zh, gj, nj, xh, th, dh, rr, ll.
- Common receipt words: TOTALI (total), TVSH (VAT/tax), ARTIKUJT (articles), FATURË (invoice), KLIENT (client), PAGESA (payment), KOPJE (copy).
- TOTALI NE EURO = total in EUR.
${itemsSection}
INSTRUCTIONS:
1. Read every item line on the receipt. Each item has a name and price in EUR.
2. Correct any garbled text — use Albanian context to infer correct names.
3. If an item name matches one of the user's existing items, set matchedExistingItem to the exact name.
4. Do NOT include subtotal lines, tax lines (TVSH), discount summaries, payment method lines, or promotional text as items.
5. For count quantities (e.g., "2 x 1.50"), extract the count as quantity and the unit price as price.
6. For weight-based items (e.g., "2.375 x 2.89" meaning 2.375kg at 2.89/kg), set quantity to the weight (2.375) and price to the total (6.86).

EXAMPLES:
"MIELL 1KG  1.20" → {"name": "Miell 1KG", "price": 1.20, "quantity": 1}
"QUM3SHT 1L  0.85" → {"name": "Qumësht 1L", "price": 0.85, "quantity": 1}
"2x BUKE  0.60" → {"name": "Bukë", "price": 0.60, "quantity": 2}
"2.375 x 2.89  6.86" → {"name": "item name", "price": 6.86, "quantity": 2.375}

Return JSON:
{
  "storeName": "store name from receipt header",
  "storeLocation": "store address if visible, or empty string",
  "items": [
    {
      "name": "corrected item name",
      "price": 1.20,
      "quantity": 1,
      "suggestedItemCategory": "category like Dairy, Bakery, Produce, Meat, Beverages, Cleaning, Snacks",
      "matchedExistingItem": "exact existing item name or null"
    }
  ],
  "totalAmount": 15.50,
  "date": "DD/MM/YYYY or null",
  "time": "HH:MM or null",
  "suggestedExpenseCategory": "Groceries"
}`;
  }

  private extractJson(response: string): Record<string, any> {
    try {
      return JSON.parse(response) as Record<string, any>;
    } catch {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in vision LLM response');
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
