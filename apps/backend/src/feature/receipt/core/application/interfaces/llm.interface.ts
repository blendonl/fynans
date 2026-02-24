export interface ILlmService {
  generateCompletion(
    prompt: string,
    options?: LlmCompletionOptions,
  ): Promise<LlmCompletionResult>;
  healthCheck(): Promise<boolean>;
}

export interface LlmCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  onToken?: (tokensSoFar: number) => void;
  format?: 'json';
  images?: string[];
  model?: string;
}

export interface LlmCompletionResult {
  response: string;
  totalDuration?: number;
  tokenCount?: number;
}
