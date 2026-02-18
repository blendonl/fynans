import { Injectable, Logger, Inject } from '@nestjs/common';
import { IOcrService } from '../services/ocr.service';
import { IReceiptParserService } from '../services/receipt-parser.service';
import { ProcessedReceiptData } from '../interfaces/processed-receipt-data.interface';
import { FetchUserContextUseCase } from './fetch-user-context.use-case';
import { ProgressTracker } from '../services/progress-tracker';

@Injectable()
export class ProcessReceiptUseCase {
  private readonly logger = new Logger(ProcessReceiptUseCase.name);

  constructor(
    @Inject('OcrService') private readonly ocrService: IOcrService,
    @Inject('ReceiptParserService')
    private readonly parserService: IReceiptParserService,
    private readonly fetchUserContextUseCase: FetchUserContextUseCase,
  ) {}

  async execute(
    imageBuffer: Buffer,
    userId?: string,
    progressTracker?: ProgressTracker,
    options?: { skipOcr?: boolean },
  ): Promise<ProcessedReceiptData> {
    // Run OCR and context fetch concurrently
    const [ocrResult, userContext] = await Promise.all([
      options?.skipOcr
        ? { text: '', confidence: 0 }
        : (async () => {
            progressTracker?.startStage('ocr');
            const ocrStart = Date.now();
            const result = await this.ocrService.extractText(imageBuffer);
            this.logger.log(`OCR completed in ${Date.now() - ocrStart}ms`);
            progressTracker?.completeStage('ocr');
            return result;
          })(),
      userId
        ? (async () => {
            progressTracker?.startStage('context');
            try {
              return await this.fetchUserContextUseCase.execute(userId);
            } catch (error) {
              this.logger.warn(
                `Failed to fetch user context: ${error instanceof Error ? error.message : error}`,
              );
              return undefined;
            } finally {
              progressTracker?.completeStage('context');
            }
          })()
        : undefined,
    ]);

    const parsingResult = await this.parserService.parse(ocrResult.text, {
      userId,
      userContext,
      confidence: ocrResult.confidence,
      rawText: ocrResult.text,
      imageBuffer,
      progressTracker,
    });

    return {
      ...parsingResult,
      extractedText: ocrResult.text,
      confidence: ocrResult.confidence,
    };
  }
}
