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
  ): Promise<ProcessedReceiptData> {
    progressTracker?.startStage('ocr');
    const ocrResult = await this.ocrService.extractText(imageBuffer);
    progressTracker?.completeStage('ocr');

    let userContext;
    if (userId) {
      progressTracker?.startStage('context');
      try {
        userContext = await this.fetchUserContextUseCase.execute(userId);
      } catch (error) {
        this.logger.warn(
          `Failed to fetch user context: ${error instanceof Error ? error.message : error}`,
        );
      }
      progressTracker?.completeStage('context');
    }

    const parsingResult = await this.parserService.parse(ocrResult.text, {
      userId,
      userContext,
      confidence: ocrResult.confidence,
      rawText: ocrResult.text,
      progressTracker,
    });

    return {
      ...parsingResult,
      extractedText: ocrResult.text,
      confidence: ocrResult.confidence,
    };
  }
}
