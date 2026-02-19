import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import {
  IReceiptParser,
  ReceiptParsingContext,
  ReceiptParsingResult,
} from '../../../application/services/receipt-parser.service';
import { IOllamaService } from '../../../application/interfaces/ollama.interface';
import { DonutHttpService } from '../donut-http.service';
import { ReceiptPostProcessor } from '../receipt-post-processor';
import { parseDateTime, extractJson } from './receipt-parser.utils';

interface EnrichedItem {
  name: string;
  nameEn?: string;
  price: number;
  quantity: number;
  suggestedItemCategory?: string;
}

interface EnrichmentResult {
  storeName?: string;
  items: EnrichedItem[];
  suggestedExpenseCategory?: string;
}

@Injectable()
export class DonutReceiptParser implements IReceiptParser {
  readonly name = 'donut-cord';
  private readonly logger = new Logger(DonutReceiptParser.name);

  constructor(
    private readonly donutService: DonutHttpService,
    private readonly postProcessor: ReceiptPostProcessor,
    @Optional()
    @Inject('OllamaService')
    private readonly ollamaService?: IOllamaService,
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
      throw new Error('Donut parser requires an image buffer');
    }
    return this.parseFromImage(context.imageBuffer, context);
  }

  async parseFromImage(
    imageBuffer: Buffer,
    context: ReceiptParsingContext,
  ): Promise<ReceiptParsingResult> {
    const isHealthy = await this.donutService.healthCheck();
    if (!isHealthy) {
      throw new Error('Donut CORD service is not available');
    }

    const tracker = context.progressTracker;
    tracker?.startStage('vision-parse');

    const rawResult = await this.donutService.parseReceipt(imageBuffer);

    const processed = this.postProcessor.process({
      storeName: rawResult.storeName,
      storeLocation: rawResult.storeLocation,
      items: rawResult.items,
      totalAmount: rawResult.totalAmount,
      date: rawResult.date,
      time: rawResult.time,
    });

    // Enrich with Ollama text LLM for categories and name normalization
    let enriched: EnrichmentResult | null = null;
    if (this.ollamaService && processed.items.length > 0) {
      try {
        enriched = await this.enrichWithLlm(
          processed.storeName,
          processed.items,
          tracker,
        );
      } catch (error) {
        this.logger.warn(
          `LLM enrichment failed, using raw Donut output: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    tracker?.completeStage('vision-parse');

    const finalItems = enriched
      ? this.mergeEnrichedItems(processed.items, enriched.items)
      : processed.items;

    return {
      storeName: enriched?.storeName || processed.storeName,
      storeLocation: processed.storeLocation,
      items: finalItems,
      totalAmount: processed.totalAmount,
      date: processed.date,
      time: processed.time,
      recordedAt: parseDateTime(processed.date, processed.time),
      suggestedExpenseCategory: enriched?.suggestedExpenseCategory,
      parserUsed: this.name,
    };
  }

  private async enrichWithLlm(
    storeName: string,
    items: Array<{ name: string; price: number; quantity: number }>,
    tracker?: ReceiptParsingContext['progressTracker'],
  ): Promise<EnrichmentResult> {
    const ollamaHealthy = await this.ollamaService!.healthCheck();
    if (!ollamaHealthy) {
      throw new Error('Ollama not available for enrichment');
    }

    const prompt = this.buildEnrichmentPrompt(storeName, items);

    const completion = await this.ollamaService!.generateCompletion(prompt, {
      onToken: tracker?.tokenCallback('vision-parse', 600),
      format: 'json',
      maxTokens: 2048,
    });

    const parsed = extractJson(completion.response) as unknown as EnrichmentResult;
    return parsed;
  }

  private buildEnrichmentPrompt(
    storeName: string,
    items: Array<{ name: string; price: number; quantity: number }>,
  ): string {
    const itemsList = items
      .map((i) => `- "${i.name}" (${i.price}€ x${i.quantity})`)
      .join('\n');

    return `You are given receipt items extracted by OCR from a Kosovo store receipt. The text is Albanian.
Normalize the item names, provide English translations, assign categories, and suggest an expense category.

Store: "${storeName}"
Items:
${itemsList}

Rules:
- Fix Albanian spelling (ë, ç, gj, sh, zh, nj). Example: "mish gjJedhi" → "Mish Gjedhi", "sheger i kafte" → "Sheqer i Kafes"
- Capitalize item names properly
- "nameEn" is REQUIRED: provide an English translation of each item
- "suggestedItemCategory" is REQUIRED for every item. Choose from: Dairy, Bakery, Meat, Produce, Beverages, Snacks, Household, Personal Care, Frozen, Canned Goods, Condiments, Grains & Pasta, Sweets, Eggs, Deli, Seafood, Baby, Pet, Other
- "suggestedExpenseCategory" is REQUIRED (e.g. Groceries, Household)
- Keep the same number of items in the same order
- Also normalize the store name if needed

Return JSON:
{
  "storeName": "Normalized Store Name",
  "items": [
    {"name": "Normalized Name", "nameEn": "English Name", "price": 1.20, "quantity": 1, "suggestedItemCategory": "Category"}
  ],
  "suggestedExpenseCategory": "Groceries"
}`;
  }

  private mergeEnrichedItems(
    original: Array<{
      name: string;
      nameEn?: string;
      price: number;
      quantity: number;
      suggestedItemCategory?: string;
    }>,
    enriched: EnrichedItem[],
  ): typeof original {
    return original.map((item, i) => {
      const enrichedItem = enriched[i];
      if (!enrichedItem) return item;

      return {
        ...item,
        // Use enriched name if it looks reasonable (not empty, not wildly different length)
        name: enrichedItem.name || item.name,
        nameEn: enrichedItem.nameEn || item.nameEn,
        // Keep original price/quantity — LLM might hallucinate numbers
        price: item.price,
        quantity: item.quantity,
        suggestedItemCategory: enrichedItem.suggestedItemCategory,
      };
    });
  }

}
