import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IOcrService,
  OcrResult,
} from '../../application/services/ocr.service';

interface PaddleOcrResponse {
  text: string;
  confidence: number;
  timings?: {
    preprocess_ms: number;
    ocr_ms: number;
    postprocess_ms: number;
    total_ms: number;
  };
}

@Injectable()
export class PaddleOcrHttpService implements IOcrService {
  private readonly logger = new Logger(PaddleOcrHttpService.name);
  private readonly serviceUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number = 3;

  constructor(private readonly configService: ConfigService) {
    this.serviceUrl = this.configService.get<string>(
      'PADDLEOCR_SERVICE_URL',
      'http://localhost:8000',
    );
    this.timeout = this.configService.get<number>('PADDLEOCR_TIMEOUT', 30000);
  }

  async extractText(imageBuffer: Buffer): Promise<OcrResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.log(
          `OCR extraction attempt ${attempt}/${this.maxRetries}`,
        );
        const startTime = Date.now();

        const formData = new FormData();
        const blob = new Blob([imageBuffer], { type: 'image/png' });
        formData.append('file', blob, 'receipt.png');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(`${this.serviceUrl}/ocr/extract`, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `PaddleOCR service error (${response.status}): ${errorText}`,
          );
        }

        const result = await response.json() as PaddleOcrResponse;
        const processingTime = Date.now() - startTime;

        this.logger.log(
          `OCR completed in ${processingTime}ms (server: ${result.timings?.total_ms ?? '?'}ms) ` +
          `with confidence ${(result.confidence * 100).toFixed(2)}%`,
        );

        return {
          text: result.text.trim(),
          confidence: result.confidence,
        };
      } catch (error) {
        lastError = error as Error;

        if (error instanceof Error && error.name === 'AbortError') {
          this.logger.error(
            `OCR request timed out after ${this.timeout}ms on attempt ${attempt}`,
          );
        } else {
          this.logger.error(
            `OCR extraction failed on attempt ${attempt}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }

        if (attempt < this.maxRetries) {
          const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          this.logger.log(`Retrying after ${backoffDelay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        }
      }
    }

    this.logger.error(
      `All ${this.maxRetries} OCR extraction attempts failed`,
    );
    throw new Error(
      `Failed to extract text from image after ${this.maxRetries} attempts: ${lastError?.message || 'Unknown error'}`,
    );
  }
}
