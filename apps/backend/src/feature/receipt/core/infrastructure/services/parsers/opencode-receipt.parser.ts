import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'child_process';
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

export class OpencodeReceiptParser implements IReceiptParser {
  readonly name = 'opencode';
  private readonly logger = new Logger(OpencodeReceiptParser.name);
  private readonly model?: string;
  private readonly timeout: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly postProcessor: ReceiptPostProcessor,
    private readonly nameNormalizer?: ItemNameNormalizerService,
  ) {
    this.model = this.configService.get<string>('OPENCODE_MODEL');
    this.timeout = parseInt(
      this.configService.get<string>('OPENCODE_TIMEOUT', '120000'),
      10,
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
      `[TIMING] Starting opencode parse, OCR text: ${text.length} chars`,
    );

    const promptStart = Date.now();
    const prompt = buildReceiptPrompt(text);
    this.logger.log(
      `[TIMING] Prompt built in ${Date.now() - promptStart}ms, prompt size: ${prompt.length} chars`,
    );

    const attempt1Start = Date.now();
    let result = await this.attemptParse(prompt, 1);
    this.logger.log(
      `[TIMING] Attempt 1 completed in ${Date.now() - attempt1Start}ms — items: ${result.items.length}`,
    );

    // Single retry if no items were extracted
    if (!result.items.length) {
      this.logger.warn(
        '[TIMING] No items from attempt 1, starting retry...',
      );
      const retryPrompt = `The previous attempt returned no items. Common reasons:
1. OCR text may be very noisy — look for ANY recognizable item names with prices nearby
2. Prices may be in unusual formats (glued with E suffix, encoded, or on separate lines)
3. The receipt may use an uncommon layout
Look at the raw text character by character and identify any items with prices.

${prompt}`;
      const attempt2Start = Date.now();
      const retryResult = await this.attemptParse(retryPrompt, 2);
      this.logger.log(
        `[TIMING] Attempt 2 (retry) completed in ${Date.now() - attempt2Start}ms — items: ${retryResult.items.length}`,
      );
      if (retryResult.items.length) {
        result = retryResult;
      }
    }

    const totalMs = Date.now() - startTime;
    this.logger.log(
      `[TIMING] Opencode total parse time: ${totalMs}ms`,
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
    const cliStart = Date.now();
    const responseText = await this.runOpencode(prompt);
    const cliMs = Date.now() - cliStart;
    this.logger.log(
      `[TIMING] Attempt ${attemptNum} — opencode CLI returned in ${cliMs}ms, response: ${responseText.length} chars`,
    );
    this.logger.debug(
      `Opencode raw text: ${responseText.substring(0, 2000)}`,
    );

    const parseStart = Date.now();
    const processed = this.parseJsonResponse(responseText);
    const parseMs = Date.now() - parseStart;

    this.logger.log(
      `[TIMING] Attempt ${attemptNum} — JSON parsing + post-processing: ${parseMs}ms | store="${processed.storeName}", items=${processed.items.length}, ` +
        `total=${processed.totalAmount}, date="${processed.date ?? 'none'}", time="${processed.time ?? 'none'}"`,
    );
    // Optional second pass: normalize OCR-garbled item names
    if (this.nameNormalizer?.isEnabled() && processed.items.length) {
      processed.items = await this.nameNormalizer.normalizeItemNames(
        processed.items,
      );
    }

    if (processed.items.length) {
      this.logger.debug(
        `Opencode parsed items: ${JSON.stringify(processed.items.map((i) => ({ name: i.name, price: i.price, qty: i.quantity, category: i.suggestedItemCategory, size: i.size })))}`,
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

  private runOpencode(prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const args = ['run', '--format', 'json'];
      if (this.model) {
        args.push('-m', this.model);
      }
      args.push('--', prompt);

      this.logger.log(
        `[TIMING] Spawning opencode CLI: model=${this.model ?? 'default'}, prompt: ${prompt.length} chars, args: [${args.slice(0, -1).join(', ')}, <prompt>]`,
      );

      const controller = new AbortController();
      const timer = setTimeout(() => {
        controller.abort();
        reject(new Error(`Opencode CLI timed out after ${this.timeout}ms`));
      }, this.timeout);

      const spawnStart = Date.now();
      const child = spawn('opencode', args, {
        signal: controller.signal,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let firstByteTime: number | null = null;
      let lastByteTime: number | null = null;
      let totalStdoutBytes = 0;
      const stdoutChunks: Buffer[] = [];
      const stderrChunks: Buffer[] = [];

      child.on('spawn', () => {
        this.logger.log(
          `[TIMING] opencode process spawned in ${Date.now() - spawnStart}ms (pid: ${child.pid})`,
        );
      });

      child.stdout.on('data', (chunk: Buffer) => {
        const now = Date.now();
        if (firstByteTime === null) {
          firstByteTime = now;
          this.logger.log(
            `[TIMING] First stdout byte after ${now - spawnStart}ms`,
          );
        }
        lastByteTime = now;
        totalStdoutBytes += chunk.length;
        stdoutChunks.push(chunk);
      });

      child.stderr.on('data', (chunk: Buffer) => stderrChunks.push(chunk));

      child.on('error', (err) => {
        clearTimeout(timer);
        this.logger.error(
          `[TIMING] opencode spawn error after ${Date.now() - spawnStart}ms: ${err.message}`,
        );
        if (err.name === 'AbortError') return; // timeout already rejected
        reject(
          new Error(`Opencode CLI spawn error: ${err.message}`),
        );
      });

      child.on('close', (code) => {
        clearTimeout(timer);
        const closeTime = Date.now();
        const totalMs = closeTime - spawnStart;
        const streamingMs = firstByteTime && lastByteTime ? lastByteTime - firstByteTime : 0;

        this.logger.log(
          `[TIMING] opencode process exited (code ${code}) — total: ${totalMs}ms, ` +
            `time-to-first-byte: ${firstByteTime ? firstByteTime - spawnStart : 'N/A'}ms, ` +
            `streaming duration: ${streamingMs}ms, ` +
            `stdout: ${totalStdoutBytes} bytes, chunks: ${stdoutChunks.length}`,
        );

        const stdout = Buffer.concat(stdoutChunks).toString('utf-8');
        const stderr = Buffer.concat(stderrChunks).toString('utf-8');

        if (stderr.trim()) {
          this.logger.warn(
            `[TIMING] opencode stderr: ${stderr.substring(0, 500)}`,
          );
        }

        if (code !== 0) {
          this.logger.error(
            `Opencode CLI exited with code ${code}: ${stderr.substring(0, 500)}`,
          );
          reject(
            new Error(
              `Opencode CLI exited with code ${code}: ${stderr.substring(0, 200)}`,
            ),
          );
          return;
        }

        try {
          const extractStart = Date.now();
          const text = this.extractTextFromJsonEvents(stdout);
          this.logger.log(
            `[TIMING] JSON event extraction: ${Date.now() - extractStart}ms, ` +
              `extracted text: ${text?.length ?? 0} chars from ${stdout.split('\n').filter(l => l.trim()).length} events`,
          );
          if (!text) {
            reject(new Error('Opencode CLI returned empty response'));
            return;
          }
          resolve(text);
        } catch (err) {
          reject(
            new Error(
              `Failed to parse opencode output: ${err instanceof Error ? err.message : String(err)}`,
            ),
          );
        }
      });
    });
  }

  private extractTextFromJsonEvents(stdout: string): string {
    const parts: string[] = [];

    // Each line is a JSON event
    for (const line of stdout.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        const event = JSON.parse(trimmed);
        if (event.type === 'text' && event.text) {
          parts.push(event.text);
        }
        // Also handle nested part structure: { type: "content", part: { type: "text", text: "..." } }
        if (event.part?.type === 'text' && event.part?.text) {
          parts.push(event.part.text);
        }
      } catch {
        // Skip non-JSON lines
      }
    }

    return parts.join('');
  }
}
