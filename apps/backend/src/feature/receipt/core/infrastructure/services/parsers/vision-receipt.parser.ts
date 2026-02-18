import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  IReceiptParser,
  ReceiptParsingContext,
  ReceiptParsingResult,
} from '../../../application/services/receipt-parser.service';
import { IOllamaService } from '../../../application/interfaces/ollama.interface';
import { type UserReceiptContext } from '../../../application/use-cases/fetch-user-context.use-case';
import { ReceiptPostProcessor } from '../receipt-post-processor';
import { parseDateTime, extractJson } from './receipt-parser.utils';
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

    // Resize image to max 1024px for faster VLM processing
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
      recordedAt: parseDateTime(processed.date, processed.time),
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
      maxTokens: 4096,
    });

    const parsed = extractJson(completion.response, {
      repair: true,
    }) as VisionParsedReceipt;
    return this.postProcessor.process(parsed);
  }

  private async resizeImage(imageBuffer: Buffer): Promise<Buffer> {
    const metadata = await sharp(imageBuffer).metadata();
    const { width, height } = metadata;

    if (!width || !height) return imageBuffer;

    const maxDim = 1024;
    if (width <= maxDim && height <= maxDim) return imageBuffer;

    const scale = Math.min(maxDim / width, maxDim / height);
    return sharp(imageBuffer)
      .resize(Math.round(width * scale), Math.round(height * scale))
      .jpeg({ quality: 92 })
      .toBuffer();
  }

  private buildVisionPrompt(userContext?: UserReceiptContext): string {
    let itemsSection = '';

    if (userContext?.items.length) {
      const itemsList = userContext.items
        .slice(0, 20)
        .map((i) => `${i.name} (${i.categoryName})`)
        .join(', ');

      if (itemsList) {
        itemsSection = `\nMatch to existing items: ${itemsList}\n`;
      }
    }

    return `Extract structured data from this receipt image. Receipts are from Kosovo. Prices in EUR. Text is Albanian (ë, ç).

Rules:
- Only extract items actually visible on the receipt.
- Each item has a name and price.
- Correct garbled text using Albanian context.
- Skip TOTALI, TVSH, tax, payment, and subtotal lines.
- "2x ITEM 0.60" means quantity=2, price=0.60.
- "2.375 x 2.89 6.86" means quantity=2.375, price=6.86 (weight-based).
${itemsSection}
Return a JSON object with this structure:
{
  "storeName": "store name",
  "storeLocation": "address or empty string",
  "items": [
    {"name": "item name", "price": 1.20, "quantity": 1, "suggestedItemCategory": "Dairy", "matchedExistingItem": null}
  ],
  "totalAmount": 15.50,
  "date": "DD/MM/YYYY",
  "time": "HH:MM",
  "suggestedExpenseCategory": "Groceries"
}`;
  }

}
