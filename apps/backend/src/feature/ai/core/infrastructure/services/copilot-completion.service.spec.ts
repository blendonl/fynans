import { ConfigService } from '@nestjs/config';
import { CopilotCompletionService } from './copilot-completion.service';

const configWith = (values: Record<string, string>) =>
  ({
    get: <T>(key: string, fallback?: T) => (values[key] ?? fallback) as T,
  }) as ConfigService;

const tokenService = { isConfigured: () => true } as never;

const timeoutOf = (service: CopilotCompletionService) =>
  (service as unknown as { timeout: number }).timeout;

describe('CopilotCompletionService timeout', () => {
  it('honours COPILOT_TIMEOUT instead of a hardcoded 15s', () => {
    const service = new CopilotCompletionService(
      configWith({ COPILOT_TIMEOUT: '45000' }),
      tokenService,
    );

    expect(timeoutOf(service)).toBe(45000);
    expect(timeoutOf(service)).not.toBe(15000);
  });

  it('falls back to the documented default when the variable is unset', () => {
    const service = new CopilotCompletionService(configWith({}), tokenService);

    expect(timeoutOf(service)).toBe(30000);
  });
});
