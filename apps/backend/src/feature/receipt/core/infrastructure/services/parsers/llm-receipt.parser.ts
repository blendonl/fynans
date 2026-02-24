import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import {
  IReceiptParser,
  ReceiptParsingContext,
  ReceiptParsingResult,
} from '../../../application/services/receipt-parser.service';
import { ILlmService } from '../../../application/interfaces/llm.interface';
import { ReceiptPostProcessor } from '../receipt-post-processor';
import { ItemNameNormalizerService } from './item-name-normalizer.service';
import { LlmJsonReceipt } from './parser.interfaces';
import {
  extractJson,
  llmJsonToParsedReceipt,
  parseDateTime,
} from './receipt-parser.utils';
import { buildReceiptPrompt } from './receipt-prompt.builder';

@Injectable()
export class LlmReceiptParser implements IReceiptParser {
  readonly name = 'llm';
  private readonly logger = new Logger(LlmReceiptParser.name);

  constructor(
    @Inject('LlmService')
    private readonly llmService: ILlmService,
    private readonly postProcessor: ReceiptPostProcessor,
    @Optional() private readonly nameNormalizer?: ItemNameNormalizerService,
  ) {}

  async parse(
    text: string,
    context: ReceiptParsingContext,
  ): Promise<ReceiptParsingResult> {
    const isHealthy = await this.llmService.healthCheck();
    if (!isHealthy) {
      throw new Error('LLM service is not available');
    }

    const tracker = context.progressTracker;

    tracker?.startStage('llm-parse');
    const llmStart = Date.now();
    this.logger.debug(`OCR text for LLM (${text.length} chars):\n${text.substring(0, 3000)}`);
    const parsePrompt = buildReceiptPrompt(text);
    let processed = await this.attemptParse(parsePrompt, tracker);

    // Single retry if no items were extracted
    if (!processed.items.length) {
      this.logger.warn(
        'LLM parse returned no items, retrying with directive prompt',
      );
      const retryPrompt = `The previous attempt returned no items. Common reasons:
1. OCR text may be very noisy — look for ANY recognizable item names with prices nearby
2. Prices may be in unusual formats (glued with E suffix, encoded, or on separate lines)
3. The receipt may use an uncommon layout
Look at the raw text character by character and identify any items with prices.

${parsePrompt}`;
      const retryResult = await this.attemptParse(retryPrompt, undefined);
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

  private async attemptParse(
    prompt: string,
    tracker?: ReceiptParsingContext['progressTracker'],
  ) {
    const completion = await this.llmService.generateCompletion(prompt, {
      format: 'json',
      onToken: tracker?.tokenCallback('llm-parse', 400),
    });
    this.logger.debug(`LLM raw response: ${completion.response.substring(0, 2000)}`);

    let json: LlmJsonReceipt;
    try {
      const raw = extractJson(completion.response, { repair: true });
      json = raw as unknown as LlmJsonReceipt;
    } catch (err) {
      this.logger.error(
        `Failed to extract JSON from LLM response: ${err instanceof Error ? err.message : String(err)}`,
      );
      return {
        storeName: 'Unknown',
        storeLocation: '',
        items: [] as ReceiptParsingResult['items'],
        totalAmount: undefined,
        date: undefined,
        time: undefined,
        suggestedExpenseCategory: undefined,
      };
    }

    const parsed = llmJsonToParsedReceipt(json);

    const withCategory = parsed.items?.filter((i) => i.suggestedItemCategory).length ?? 0;
    this.logger.log(
      `LLM raw response: store="${parsed.storeName}", items=${parsed.items?.length ?? 0}, ` +
      `withCategory=${withCategory}, total=${parsed.totalAmount}, date="${parsed.date ?? 'none'}", time="${parsed.time ?? 'none'}"`,
    );
    if (parsed.items?.length) {
      this.logger.debug(
        `LLM parsed items: ${JSON.stringify(parsed.items.map((i) => ({ name: i.name, price: i.price, qty: i.quantity, category: i.suggestedItemCategory })))}`,
      );
    }

    const processed = this.postProcessor.process(parsed);

    this.logger.log(
      `Post-processed: ${processed.items.length} items, sizes extracted: ${processed.items.filter((i) => i.size).length}`,
    );

    // Optional second pass: normalize OCR-garbled item names
    if (this.nameNormalizer?.isEnabled() && processed.items.length) {
      processed.items = await this.nameNormalizer.normalizeItemNames(
        processed.items,
      );
    }

    return processed;
  }
}
