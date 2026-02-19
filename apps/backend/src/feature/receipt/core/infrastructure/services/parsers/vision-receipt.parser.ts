import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  IReceiptParser,
  ReceiptParsingContext,
  ReceiptParsingResult,
} from '../../../application/services/receipt-parser.service';
import { IOllamaService } from '../../../application/interfaces/ollama.interface';
import { ReceiptPostProcessor } from '../receipt-post-processor';
import { parseDateTime, extractJson } from './receipt-parser.utils';
import sharp from 'sharp';

interface VisionParsedReceipt {
  storeName?: string;
  storeLocation?: string;
  items?: Array<{
    name: string;
    nameEn?: string;
    price: number;
    quantity?: number;
    suggestedItemCategory?: string;
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

    const prompt = this.buildVisionPrompt();
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

    this.logger.log(
      `Vision raw response: store="${parsed.storeName}", items=${parsed.items?.length ?? 0}, total=${parsed.totalAmount}`,
    );
    if (parsed.items?.length) {
      this.logger.debug(
        `Vision parsed items: ${JSON.stringify(parsed.items.map((i) => ({ name: i.name, nameEn: i.nameEn, price: i.price, category: i.suggestedItemCategory })))}`,
      );
    }

    const processed = this.postProcessor.process(parsed);

    this.logger.log(
      `Post-processed: ${processed.items.length} items, sizes extracted: ${processed.items.filter((i) => i.size).length}`,
    );

    return processed;
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

  private buildVisionPrompt(): string {
    return `You extract structured data from Kosovo store receipt images. Return ONLY valid JSON.

Context: Kosovo receipt, prices in EUR, text in Albanian (ë, ç, sh, zh, gj, nj).
NOT items: TOTALI, TVSH, tax, subtotal, payment, KLIENT, ATK, NR SERIAL, KOPJE.

EVERY item MUST have ALL 5 fields: name, nameEn, price, quantity, suggestedItemCategory.
The receipt MUST have: date (DD/MM/YYYY), time (HH:MM). Look for them carefully on the receipt.

Rules:
- "name": Albanian name from receipt (keep size info like 1KG, 500g)
- "nameEn": English translation (REQUIRED)
- "suggestedItemCategory": a short grocery category name (REQUIRED), e.g. "Dairy", "Meat", "Cleaning Products"
- Correct garbled text using Albanian context
- Quantity defaults to 1. For "2.375 x 2.89 = 6.86": quantity=2.375, price=6.86
- "2x ITEM 0.60" means quantity=2, price=0.60

Return JSON: {"storeName":"...","storeLocation":"...","items":[{"name":"...","nameEn":"...","price":0.00,"quantity":1,"suggestedItemCategory":"..."}],"totalAmount":0.00,"date":"DD/MM/YYYY","time":"HH:MM","suggestedExpenseCategory":"Groceries"}`;
  }
}
