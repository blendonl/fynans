import { Injectable, Logger, Inject } from '@nestjs/common';
import { IOcrService } from '../services/ocr.service';
import { IReceiptParserService } from '../services/receipt-parser.service';
import { ProcessedReceiptData } from '../interfaces/processed-receipt-data.interface';
import { ProgressTracker } from '../services/progress-tracker';

@Injectable()
export class ProcessReceiptUseCase {
  private readonly logger = new Logger(ProcessReceiptUseCase.name);

  constructor(
    @Inject('OcrService') private readonly ocrService: IOcrService,
    @Inject('ReceiptParserService')
    private readonly parserService: IReceiptParserService,
  ) {}

  async execute(
    imageBuffer: Buffer,
    userId?: string,
    progressTracker?: ProgressTracker,
    options?: { skipOcr?: boolean },
  ): Promise<ProcessedReceiptData> {
    let ocrResult = { text: '', confidence: 0 };

    if (!options?.skipOcr) {
      progressTracker?.startStage('ocr');
      const ocrStart = Date.now();
      ocrResult = await this.ocrService.extractText(imageBuffer);
      this.logger.log(`OCR completed in ${Date.now() - ocrStart}ms`);
      progressTracker?.completeStage('ocr');
    }

    const parsingResult = await this.parserService.parse(ocrResult.text, {
      userId,
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
