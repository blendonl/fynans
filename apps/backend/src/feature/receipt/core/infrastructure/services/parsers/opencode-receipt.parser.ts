import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CopilotTokenService } from '~common/services/copilot-token.service';
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

export class OpencodeReceiptParser implements IReceiptParser {
  readonly name = 'copilot';
  private readonly logger = new Logger(OpencodeReceiptParser.name);
  private readonly model: string;
  private readonly fallbackModel: string;
  private readonly timeout: number;
  private readonly apiEndpoint: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly postProcessor: ReceiptPostProcessor,
    private readonly nameNormalizer: ItemNameNormalizerService | undefined,
    private readonly tokenService: CopilotTokenService,
  ) {
    this.model = this.configService.get<string>(
      'COPILOT_MODEL',
      'claude-sonnet-4-20250514',
    );
    this.fallbackModel = this.configService.get<string>(
      'COPILOT_FALLBACK_MODEL',
      'gpt-4o',
    );
    this.timeout = parseInt(
      this.configService.get<string>('COPILOT_TIMEOUT', '30000'),
      10,
    );
    this.apiEndpoint = this.configService.get<string>(
      'COPILOT_API_ENDPOINT',
      'https://api.githubcopilot.com/chat/completions',
    );
  }

  async parse(
    text: string,
    context: ReceiptParsingContext,
  ): Promise<ReceiptParsingResult> {
    const tracker = context.progressTracker;

    tracker?.startStage('llm-parse');
    const startTime = Date.now();
    this.logger.log(
      `[TIMING] Starting parse, OCR text: ${text.length} chars`,
    );

    const prompt = buildReceiptPrompt(text);
    this.logger.log(
      `[TIMING] Prompt size: ${prompt.length} chars`,
    );

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
    const responseText = await this.callCopilotApi(prompt);
    this.logger.log(
      `[TIMING] Attempt ${attemptNum} — API returned in ${Date.now() - apiStart}ms, response: ${responseText.length} chars`,
    );
    this.logger.debug(
      `Raw response: ${responseText.substring(0, 2000)}`,
    );

    const parseStart = Date.now();
    const processed = this.parseJsonResponse(responseText);
    this.logger.log(
      `[TIMING] Attempt ${attemptNum} — JSON parsing: ${Date.now() - parseStart}ms | store="${processed.storeName}", items=${processed.items.length}, ` +
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

  private async callCopilotApi(prompt: string): Promise<string> {
    try {
      return await this.doApiCall(prompt, this.model);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      if (message.includes('401')) {
        this.logger.warn('Copilot API returned 401, refreshing token and retrying...');
        await this.tokenService.refreshIfUnauthorized();
        return this.doApiCall(prompt, this.model);
      }

      if (this.fallbackModel !== this.model) {
        this.logger.warn(
          `Primary model '${this.model}' failed (${message}), falling back to '${this.fallbackModel}'`,
        );
        return this.doApiCall(prompt, this.fallbackModel);
      }

      throw err;
    }
  }

  private async doApiCall(prompt: string, model: string): Promise<string> {
    const token = await this.tokenService.getToken();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    const apiStart = Date.now();
    this.logger.log(
      `[TIMING] Calling Copilot API: model=${model}, endpoint=${this.apiEndpoint}`,
    );

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Copilot-Integration-Id': 'vscode-chat',
        },
        body: JSON.stringify({
          model,
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
          `Copilot API error ${response.status}: ${body.substring(0, 200)}`,
        );
      }

      const data = (await response.json()) as {
        choices: Array<{ message: { content: string } }>;
        usage?: { prompt_tokens: number; completion_tokens: number };
      };

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Copilot API returned empty content');
      }

      const usage = data.usage;
      this.logger.log(
        `[TIMING] Copilot API completed in ${Date.now() - apiStart}ms (model=${model})` +
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
