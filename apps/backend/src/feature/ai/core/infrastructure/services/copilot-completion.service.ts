import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import {
  IOllamaService,
  OllamaCompletionOptions,
  OllamaCompletionResult,
} from '~feature/receipt/core/application/interfaces/ollama.interface';

interface CopilotAuthData {
  'github-copilot'?: {
    type: string;
    access: string;
    refresh: string;
    expires: number;
  };
}

@Injectable()
export class CopilotCompletionService implements IOllamaService {
  private readonly logger = new Logger(CopilotCompletionService.name);
  private readonly model: string;
  private readonly timeout: number;
  private readonly apiEndpoint: string;
  private cachedToken: string | null = null;

  constructor(private readonly configService: ConfigService) {
    this.model = this.configService.get<string>(
      'COPILOT_CATEGORY_MODEL',
      'gpt-4o',
    );
    this.timeout = 15_000;
    this.apiEndpoint = this.configService.get<string>(
      'COPILOT_API_ENDPOINT',
      'https://api.githubcopilot.com/chat/completions',
    );
  }

  async generateCompletion(
    prompt: string,
    options?: OllamaCompletionOptions,
  ): Promise<OllamaCompletionResult> {
    const token = await this.getAuthToken();

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
        totalDuration: duration * 1e6, // ms → ns to match Ollama convention
        tokenCount: usage?.completion_tokens,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.getAuthToken();
      return true;
    } catch {
      return false;
    }
  }

  private async getAuthToken(): Promise<string> {
    if (this.cachedToken) return this.cachedToken;

    const authPath = join(
      homedir(),
      '.local',
      'share',
      'opencode',
      'auth.json',
    );

    try {
      const raw = await readFile(authPath, 'utf-8');
      const auth = JSON.parse(raw) as CopilotAuthData;
      const token = auth['github-copilot']?.access;
      if (!token) {
        throw new Error(
          'No github-copilot access token found in auth.json',
        );
      }
      this.cachedToken = token;
      return token;
    } catch (err) {
      throw new Error(
        `Failed to read Copilot auth token: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
