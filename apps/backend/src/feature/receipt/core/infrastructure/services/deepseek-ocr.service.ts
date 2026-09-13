import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IOcrService, OcrResult } from '../../application/services/ocr.service';

interface DeepSeekChatResponse {
  choices: Array<{
    message: { content: string };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

@Injectable()
export class DeepseekOcrService implements IOcrService {
  private readonly logger = new Logger(DeepseekOcrService.name);
  private readonly apiKey: string;
  private readonly model: string;
  private readonly endpoint: string;
  private readonly timeout: number;
  private readonly maxRetries = 3;
  private readonly maxImageBytes = 10 * 1024 * 1024; // 10MB before base64

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DEEPSEEK_API_KEY', '');
    this.model = this.configService.get<string>(
      'DEEPSEEK_OCR_MODEL',
      'deepseek/deepseek-ocr-2',
    );
    this.endpoint = this.configService.get<string>(
      'DEEPSEEK_OCR_ENDPOINT',
      'https://api.deepseek.com',
    );
    this.timeout = parseInt(
      this.configService.get<string>('DEEPSEEK_OCR_TIMEOUT', '60000'),
      10,
    );
  }

  async extractText(imageBuffer: Buffer): Promise<OcrResult> {
    if (!this.apiKey) {
      throw new Error(
        'DEEPSEEK_API_KEY is required when OCR_ENGINE=deepseek',
      );
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.log(
          `DeepSeek OCR extraction attempt ${attempt}/${this.maxRetries}`,
        );
        const startTime = Date.now();

        const processedBuffer = await this.prepareImage(imageBuffer);
        const base64Image = processedBuffer.toString('base64');
        const mimeType = 'image/jpeg';

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(`${this.endpoint}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:${mimeType};base64,${base64Image}`,
                    },
                  },
                  {
                    type: 'text',
                    text: '<image>\nFree OCR.',
                  },
                ],
              },
            ],
            max_tokens: 4096,
            temperature: 0,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `DeepSeek OCR API error (${response.status}): ${errorText.substring(0, 500)}`,
          );
        }

        const data = (await response.json()) as DeepSeekChatResponse;
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error('DeepSeek OCR API returned empty content');
        }

        const processingTime = Date.now() - startTime;

        this.logger.log(
          `DeepSeek OCR completed in ${processingTime}ms` +
            (data.usage
              ? ` — tokens: input=${data.usage.prompt_tokens}, output=${data.usage.completion_tokens}`
              : ''),
        );

        this.logger.debug(`DeepSeek OCR raw text:\n${content.substring(0, 3000)}`);

        return {
          text: content.trim(),
          confidence: 1.0, // Vision model doesn't provide per-character confidence
        };
      } catch (error) {
        lastError = error as Error;

        if (error instanceof Error && error.name === 'AbortError') {
          this.logger.error(
            `DeepSeek OCR request timed out after ${this.timeout}ms on attempt ${attempt}`,
          );
        } else {
          this.logger.error(
            `DeepSeek OCR extraction failed on attempt ${attempt}: ${error instanceof Error ? error.message : String(error)}`,
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
      `All ${this.maxRetries} DeepSeek OCR extraction attempts failed`,
    );
    throw new Error(
      `Failed to extract text via DeepSeek OCR after ${this.maxRetries} attempts: ${lastError?.message || 'Unknown error'}`,
    );
  }

  /**
   * Prepares the image for the API call.
   * Converts to JPEG and resizes if needed to stay under size limits.
   */
  private async prepareImage(imageBuffer: Buffer): Promise<Buffer> {
    // If already small enough, send as-is (after converting to base64 in caller)
    if (imageBuffer.length <= this.maxImageBytes) {
      return imageBuffer;
    }

    try {
      // Dynamic import sharp — it's already a dependency
      const sharp = await import('sharp');
      const metadata = await sharp.default(imageBuffer).metadata();

      const maxDim = 2048;
      let pipeline = sharp.default(imageBuffer).jpeg({ quality: 85 });

      const width = metadata.width ?? 0;
      const height = metadata.height ?? 0;

      if (width > maxDim || height > maxDim) {
        pipeline = pipeline.resize(maxDim, maxDim, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      const resized = await pipeline.toBuffer();

      this.logger.log(
        `Image resized: ${(imageBuffer.length / 1024).toFixed(0)}KB → ${(resized.length / 1024).toFixed(0)}KB ` +
          `(${width}×${height} → max ${maxDim}px)`,
      );

      return resized;
    } catch (err) {
      this.logger.warn(
        `Failed to resize image with sharp (${err instanceof Error ? err.message : String(err)}), sending original`,
      );
      return imageBuffer;
    }
  }
}
