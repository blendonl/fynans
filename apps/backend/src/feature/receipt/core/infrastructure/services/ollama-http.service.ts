import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IOllamaService,
  OllamaCompletionOptions,
  OllamaCompletionResult,
} from '../../application/interfaces/ollama.interface';

@Injectable()
export class OllamaHttpService implements IOllamaService {
  private readonly logger = new Logger(OllamaHttpService.name);
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly maxRetries = 2;
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>(
      'OLLAMA_SERVICE_URL',
      'http://localhost:11434',
    );
    this.model = this.configService.get<string>(
      'OLLAMA_MODEL',
      'qwen2.5:3b',
    );
    this.timeoutMs = this.configService.get<number>(
      'OLLAMA_TIMEOUT',
      120_000,
    );
  }

  async generateCompletion(
    prompt: string,
    options?: OllamaCompletionOptions,
  ): Promise<OllamaCompletionResult> {
    const useStreaming = !!options?.onToken;

    const body = {
      model: this.model,
      prompt,
      stream: useStreaming,
      options: {
        temperature: options?.temperature ?? 0.1,
        ...(options?.maxTokens && { num_predict: options.maxTokens }),
      },
    };

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = Math.pow(2, attempt) * 500;
          this.logger.warn(
            `Retry attempt ${attempt}/${this.maxRetries} after ${delay}ms`,
          );
          await this.sleep(delay);
        }

        const controller = new AbortController();
        const timeout = setTimeout(
          () => controller.abort(),
          this.timeoutMs,
        );

        try {
          const response = await fetch(`${this.baseUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(
              `Ollama returned ${response.status}: ${await response.text()}`,
            );
          }

          if (useStreaming) {
            return await this.readStream(response, options!.onToken!);
          }

          const data = (await response.json()) as {
            response: string;
            total_duration?: number;
            eval_count?: number;
          };

          return {
            response: data.response,
            totalDuration: data.total_duration,
            tokenCount: data.eval_count,
          };
        } finally {
          clearTimeout(timeout);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.error(
          `Ollama request failed (attempt ${attempt + 1}): ${lastError.message}`,
        );
      }
    }

    throw lastError ?? new Error('Ollama request failed');
  }

  private async readStream(
    response: Response,
    onToken: (tokensSoFar: number) => void,
  ): Promise<OllamaCompletionResult> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let tokenCount = 0;
    let totalDuration: number | undefined;
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const chunk = JSON.parse(line) as {
            response?: string;
            done?: boolean;
            total_duration?: number;
            eval_count?: number;
          };

          if (chunk.response) {
            fullResponse += chunk.response;
            tokenCount++;
            onToken(tokenCount);
          }

          if (chunk.done) {
            totalDuration = chunk.total_duration;
            if (chunk.eval_count) tokenCount = chunk.eval_count;
          }
        } catch {
          // skip malformed lines
        }
      }
    }

    // process remaining buffer
    if (buffer.trim()) {
      try {
        const chunk = JSON.parse(buffer) as {
          response?: string;
          done?: boolean;
          total_duration?: number;
          eval_count?: number;
        };
        if (chunk.response) {
          fullResponse += chunk.response;
          tokenCount++;
        }
        if (chunk.done) {
          totalDuration = chunk.total_duration;
          if (chunk.eval_count) tokenCount = chunk.eval_count;
        }
      } catch {
        // ignore
      }
    }

    return { response: fullResponse, totalDuration, tokenCount };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(`${this.baseUrl}/api/tags`, {
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

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
