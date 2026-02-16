export interface IOllamaService {
  generateCompletion(
    prompt: string,
    options?: OllamaCompletionOptions,
  ): Promise<OllamaCompletionResult>;
  healthCheck(): Promise<boolean>;
}

export interface OllamaCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  onToken?: (tokensSoFar: number) => void;
  format?: 'json';
  images?: string[];
  model?: string;
}

export interface OllamaCompletionResult {
  response: string;
  totalDuration?: number;
  tokenCount?: number;
}
