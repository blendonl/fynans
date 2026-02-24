import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ILlmService,
  LlmCompletionOptions,
  LlmCompletionResult,
} from '~feature/receipt/core/application/interfaces/llm.interface';
import { CopilotTokenService } from '~common/services/copilot-token.service';

@Injectable()
export class CopilotCompletionService implements ILlmService {
  private readonly logger = new Logger(CopilotCompletionService.name);
  private readonly model: string;
  private readonly timeout: number;
  private readonly apiEndpoint: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly tokenService: CopilotTokenService,
  ) {
    this.model = this.configService.get<string>('COPILOT_FALLBACK_MODEL', 'gpt-4o');
    this.timeout = 15_000;
    this.apiEndpoint = this.configService.get<string>(
      'COPILOT_API_ENDPOINT',
      'https://api.githubcopilot.com/chat/completions',
    );
  }

  async generateCompletion(
    prompt: string,
    options?: LlmCompletionOptions,
  ): Promise<LlmCompletionResult> {
    return this.callWithRetry(prompt, options);
  }

  async healthCheck(): Promise<boolean> {
    return this.tokenService.isConfigured();
  }

  private async callWithRetry(
    prompt: string,
    options?: LlmCompletionOptions,
  ): Promise<LlmCompletionResult> {
    try {
      return await this.doCall(prompt, options);
    } catch (err) {
      if (err instanceof Error && err.message.includes('401')) {
        this.logger.warn('Copilot API returned 401, refreshing token and retrying...');
        await this.tokenService.refreshIfUnauthorized();
        return this.doCall(prompt, options);
      }
      throw err;
    }
  }

  private async doCall(
    prompt: string,
    options?: LlmCompletionOptions,
  ): Promise<LlmCompletionResult> {
    const token = await this.tokenService.getToken();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    const messages: Array<{ role: string; content: string }> = [];

    if (options?.format === 'json') {
      messages.push({
        role: 'system',
        content:
          'You must respond with valid JSON only. No markdown fences, no explanation, no text outside the JSON object.',
      });
    }

    messages.push({ role: 'user', content: prompt });

    const startTime = Date.now();

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Copilot-Integration-Id': 'vscode-chat',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: options?.maxTokens ?? 200,
          temperature: options?.temperature ?? 0,
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

      const duration = Date.now() - startTime;
      const usage = data.usage;
      this.logger.log(
        `Copilot completion in ${duration}ms` +
          (usage
            ? ` — tokens: input=${usage.prompt_tokens}, output=${usage.completion_tokens}`
            : ''),
      );

      return {
        response: content,
        totalDuration: duration * 1e6,
        tokenCount: usage?.completion_tokens,
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
