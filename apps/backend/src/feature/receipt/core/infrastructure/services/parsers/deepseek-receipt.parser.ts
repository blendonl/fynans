import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IReceiptParser,
  ReceiptParsingContext,
  ReceiptParsingResult,
} from '../../../application/services/receipt-parser.service';
import { LlmJsonReceipt } from './parser.interfaces';
import {
  extractJson,
  llmJsonToParsedReceipt,
  parseDateTime,
} from './receipt-parser.utils';
import { buildReceiptPrompt } from './receipt-prompt.builder';
import { ReceiptPostProcessor } from '../receipt-post-processor';
import { ItemNameNormalizerService } from './item-name-normalizer.service';

const SYSTEM_PROMPT =
  'You are a receipt data extraction tool. Return ONLY valid JSON. No explanation, no reasoning, no markdown fences.';

export class DeepseekReceiptParser implements IReceiptParser {
  readonly name = 'deepseek';
  private readonly logger = new Logger(DeepseekReceiptParser.name);
  private readonly apiKey: string;
  private readonly model: string;
  private readonly endpoint: string;
  private readonly timeout: number;
  private readonly maxRetries = 3;

  constructor(
    private readonly configService: ConfigService,
    private readonly postProcessor: ReceiptPostProcessor,
    private readonly nameNormalizer: ItemNameNormalizerService | undefined,
  ) {
    this.apiKey = this.configService.get<string>('DEEPSEEK_API_KEY', '');

    this.model = this.configService.get<string>(
      'DEEPSEEK_PARSER_MODEL',
      'deepseek-chat',
    );

    // Parser endpoint defaults to OCR endpoint if not set
    this.endpoint = this.configService.get<string>(
      'DEEPSEEK_PARSER_ENDPOINT',
      '',
    ) || this.configService.get<string>(
      'DEEPSEEK_OCR_ENDPOINT',
      'https://api.deepseek.com',
    );

    this.timeout = parseInt(
      this.configService.get<string>('DEEPSEEK_PARSER_TIMEOUT', '60000'),
      10,
    );
  }

  async parse(
    text: string,
    context: ReceiptParsingContext,
  ): Promise<ReceiptParsingResult> {
    if (!this.apiKey) {
      throw new Error(
        'DEEPSEEK_API_KEY is required when DEEPSEEK_PARSER_ENABLED=true',
      );
    }

    const tracker = context.progressTracker;

    tracker?.startStage('llm-parse');
    const startTime = Date.now();
    this.logger.log(
      `[TIMING] Starting DeepSeek parse, OCR text: ${text.length} chars`,
    );

    const prompt = buildReceiptPrompt(text);
    this.logger.log(`[TIMING] Prompt size: ${prompt.length} chars`);

    const tickCb = tracker?.tokenCallback('llm-parse', 8);
    let ticks = 0;
    const progressTimer = tickCb
      ? setInterval(() => tickCb(++ticks), 1000)
      : undefined;

    let result: Awaited<ReturnType<typeof this.attemptParse>>;
    try {
      result = await this.attemptParse(prompt, 1);
      this.logger.log(
        `[TIMING] Attempt 1 completed in ${Date.now() - startTime}ms — items: ${result.items.length}`,
      );

      if (!result.items.length) {
        this.logger.warn(
          '[TIMING] No items from attempt 1, starting retry...',
        );
        const retryPrompt = `The previous attempt returned no items. Look carefully for ANY item names with prices.\n\n${prompt}`;
        const retryResult = await this.attemptParse(retryPrompt, 2);
        this.logger.log(
          `[TIMING] Attempt 2 completed in ${Date.now() - startTime}ms — items: ${retryResult.items.length}`,
        );
        if (retryResult.items.length) {
          result = retryResult;
        }
      }
    } finally {
      if (progressTimer) clearInterval(progressTimer);
    }

    this.logger.log(
      `[TIMING] Total parse time: ${Date.now() - startTime}ms`,
    );
    tracker?.completeStage('llm-parse');

    return {
      storeName: result.storeName,
      storeLocation: result.storeLocation,
      items: result.items,
      totalAmount: result.totalAmount,
      date: result.date,
      time: result.time,
      recordedAt: parseDateTime(result.date, result.time),
      suggestedExpenseCategory: result.suggestedExpenseCategory,
      parserUsed: this.name,
    };
  }

  private async attemptParse(prompt: string, attemptNum: number) {
    const apiStart = Date.now();
    const responseText = await this.callApiWithRetry(prompt);
    this.logger.log(
      `[TIMING] Attempt ${attemptNum} — API returned in ${Date.now() - apiStart}ms, response: ${responseText.length} chars`,
    );
    this.logger.debug(
      `Raw response: ${responseText.substring(0, 2000)}`,
    );

    const parseStart = Date.now();
    const processed = this.parseJsonResponse(responseText);
    this.logger.log(
      `[TIMING] Attempt ${attemptNum} — JSON parsing: ${Date.now() - parseStart}ms | ` +
        `store="${processed.storeName}", items=${processed.items.length}, ` +
        `total=${processed.totalAmount}, date="${processed.date ?? 'none'}", time="${processed.time ?? 'none'}"`,
    );

    if (this.nameNormalizer?.isEnabled() && processed.items.length) {
      processed.items = await this.nameNormalizer.normalizeItemNames(
        processed.items,
      );
    }

    if (processed.items.length) {
      this.logger.debug(
        `Parsed items: ${JSON.stringify(processed.items.map((i) => ({ name: i.name, price: i.price, qty: i.quantity, category: i.suggestedItemCategory, size: i.size })))}`,
      );
    }

    return processed;
  }

  private parseJsonResponse(responseText: string) {
    let json: LlmJsonReceipt;
    try {
      const raw = extractJson(responseText, { repair: true });
      json = raw as unknown as LlmJsonReceipt;
    } catch (err) {
      this.logger.error(
        `Failed to extract JSON from DeepSeek response: ${err instanceof Error ? err.message : String(err)}`,
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
    const processed = this.postProcessor.process(parsed);

    return {
      storeName: processed.storeName,
      storeLocation: processed.storeLocation,
      items: processed.items,
      totalAmount: processed.totalAmount,
      date: processed.date,
      time: processed.time,
      suggestedExpenseCategory: processed.suggestedExpenseCategory,
    };
  }

  private async callApiWithRetry(prompt: string): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.doApiCall(prompt);
      } catch (err) {
        lastError = err as Error;
        const message = err instanceof Error ? err.message : String(err);

        this.logger.error(
          `DeepSeek API call failed on attempt ${attempt}: ${message}`,
        );

        if (attempt < this.maxRetries) {
          const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          this.logger.log(`Retrying after ${backoffDelay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        }
      }
    }

    throw new Error(
      `DeepSeek API call failed after ${this.maxRetries} attempts: ${lastError?.message || 'Unknown error'}`,
    );
  }

  private async doApiCall(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    const apiStart = Date.now();
    this.logger.log(
      `[TIMING] Calling DeepSeek API: model=${this.model}, endpoint=${this.endpoint}`,
    );

    try {
      const response = await fetch(`${this.endpoint}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          max_tokens: 4000,
          temperature: 0,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          `DeepSeek API error ${response.status}: ${body.substring(0, 500)}`,
        );
      }

      const data = (await response.json()) as {
        choices: Array<{ message: { content: string } }>;
        usage?: { prompt_tokens: number; completion_tokens: number };
      };

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('DeepSeek API returned empty content');
      }

      const usage = data.usage;
      this.logger.log(
        `[TIMING] DeepSeek API completed in ${Date.now() - apiStart}ms (model=${this.model})` +
          (usage
            ? ` — tokens: input=${usage.prompt_tokens}, output=${usage.completion_tokens}`
            : ''),
      );

      return content;
    } finally {
      clearTimeout(timer);
    }
  }
}
