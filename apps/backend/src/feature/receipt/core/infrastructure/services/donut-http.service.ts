import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface DonutParseResult {
  storeName: string;
  storeLocation: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount?: number;
  date?: string;
  time?: string;
}

@Injectable()
export class DonutHttpService {
  private readonly logger = new Logger(DonutHttpService.name);
  private readonly serviceUrl: string;
  private readonly timeout: number;
  private readonly maxRetries = 3;

  constructor(private readonly configService: ConfigService) {
    this.serviceUrl = this.configService.get<string>(
      'DONUT_SERVICE_URL',
      'http://localhost:8001',
    );
    this.timeout = this.configService.get<number>('DONUT_TIMEOUT', 120_000);
  }

  async parseReceipt(imageBuffer: Buffer): Promise<DonutParseResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.log(
          `Donut parse attempt ${attempt}/${this.maxRetries}`,
        );
        const startTime = Date.now();

        const formData = new FormData();
        const blob = new Blob([imageBuffer], { type: 'image/png' });
        formData.append('file', blob, 'receipt.png');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(`${this.serviceUrl}/parse`, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Donut service error (${response.status}): ${errorText}`,
          );
        }

        const result = (await response.json()) as DonutParseResult;
        const processingTime = Date.now() - startTime;

        this.logger.log(
          `Donut parse completed in ${processingTime}ms — ${result.items?.length ?? 0} items`,
        );

        return result;
      } catch (error) {
        lastError = error as Error;

        if (error instanceof Error && error.name === 'AbortError') {
          this.logger.error(
            `Donut request timed out after ${this.timeout}ms on attempt ${attempt}`,
          );
        } else {
          this.logger.error(
            `Donut parse failed on attempt ${attempt}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }

        if (attempt < this.maxRetries) {
          const backoffDelay = Math.min(
            1000 * Math.pow(2, attempt - 1),
            5000,
          );
          this.logger.log(`Retrying after ${backoffDelay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        }
      }
    }

    this.logger.error(
      `All ${this.maxRetries} Donut parse attempts failed`,
    );
    throw new Error(
      `Failed to parse receipt after ${this.maxRetries} attempts: ${lastError?.message || 'Unknown error'}`,
    );
  }

  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(`${this.serviceUrl}/health`, {
          signal: controller.signal,
        });
        return response.ok;
      } finally {
        clearTimeout(timeout);
      }
    } catch {
      return false;
    }
  }
}
