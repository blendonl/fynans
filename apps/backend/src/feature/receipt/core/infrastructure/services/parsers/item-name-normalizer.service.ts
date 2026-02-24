import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ILlmService } from '../../../application/interfaces/llm.interface';
import { extractJson } from './receipt-parser.utils';
import { buildItemNameNormalizationPrompt } from './receipt-prompt.builder';

interface NormalizationResult {
  original: string;
  corrected: string;
}

@Injectable()
export class ItemNameNormalizerService {
  private readonly logger = new Logger(ItemNameNormalizerService.name);
  private readonly enabled: boolean;

  constructor(
    @Inject('LlmService')
    private readonly llmService: ILlmService,
    configService: ConfigService,
  ) {
    this.enabled =
      configService.get<string>('RECEIPT_NORMALIZE_NAMES', 'false') === 'true';
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async normalizeItemNames<T extends { name: string; suggestedItemCategory?: string }>(
    items: T[],
  ): Promise<T[]> {
    if (!this.enabled || items.length === 0) return items;

    const startTime = Date.now();
    try {
      const prompt = buildItemNameNormalizationPrompt(
        items.map((i) => ({ name: i.name, category: i.suggestedItemCategory })),
      );

      const completion = await this.llmService.generateCompletion(prompt, {
        format: 'json',
      });

      let corrections: NormalizationResult[];
      try {
        const raw = extractJson(completion.response, { repair: true });
        corrections = (Array.isArray(raw) ? raw : (raw as any).items ?? raw) as NormalizationResult[];
      } catch {
        this.logger.warn('Failed to parse normalization response, skipping');
        return items;
      }

      if (!Array.isArray(corrections)) return items;

      const correctionMap = new Map<string, string>();
      for (const c of corrections) {
        if (c.original && c.corrected && c.original !== c.corrected) {
          correctionMap.set(c.original.toLowerCase(), c.corrected);
        }
      }

      let correctedCount = 0;
      const result = items.map((item) => {
        const correction = correctionMap.get(item.name.toLowerCase());
        if (correction) {
          correctedCount++;
          return { ...item, name: correction };
        }
        return item;
      });

      this.logger.log(
        `Name normalization: ${correctedCount}/${items.length} items corrected in ${Date.now() - startTime}ms`,
      );

      return result;
    } catch (err) {
      this.logger.warn(
        `Name normalization failed, using original names: ${err instanceof Error ? err.message : String(err)}`,
      );
      return items;
    }
  }
}
