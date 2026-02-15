import { ConfigService } from '@nestjs/config';
import { OllamaHttpService } from './ollama-http.service';

describe('OllamaHttpService', () => {
  let service: OllamaHttpService;
  let configService: ConfigService;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          OLLAMA_SERVICE_URL: 'http://localhost:11434',
          OLLAMA_MODEL: 'qwen2.5:3b',
        };
        return config[key] ?? defaultValue;
      }),
    } as any;

    service = new OllamaHttpService(configService);
    originalFetch = global.fetch;

    // Eliminate retry delays in tests
    (service as any).sleep = jest.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateCompletion', () => {
    it('should successfully generate a completion', async () => {
      const mockResponse = {
        response: 'Generated text output',
        total_duration: 1500000000,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await service.generateCompletion('Parse this receipt');

      expect(result).toEqual({
        response: 'Generated text output',
        totalDuration: 1500000000,
      });
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure then succeed', async () => {
      global.fetch = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            response: 'Success after retries',
            total_duration: 2000000000,
          }),
        } as Response);

      const result = await service.generateCompletion('Parse this receipt');

      expect(result.response).toBe('Success after retries');
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(
        service.generateCompletion('Parse this receipt'),
      ).rejects.toThrow('Network error');
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle non-OK response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal server error',
      } as Response);

      await expect(
        service.generateCompletion('Parse this receipt'),
      ).rejects.toThrow(/Ollama returned 500/);
    });

    it('should use correct config values', async () => {
      const customConfigService = {
        get: jest.fn((key: string, defaultValue?: any) => {
          if (key === 'OLLAMA_SERVICE_URL') return 'http://custom:11434';
          if (key === 'OLLAMA_MODEL') return 'llama3:8b';
          return defaultValue;
        }),
      } as any;

      const customService = new OllamaHttpService(customConfigService);

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ response: 'Test', total_duration: 100 }),
      } as Response);

      await customService.generateCompletion('Test prompt');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://custom:11434/api/generate',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"model":"llama3:8b"'),
        }),
      );
    });
  });

  describe('healthCheck', () => {
    it('should return true when healthy', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
      } as Response);

      const result = await service.healthCheck();

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/tags',
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      );
    });

    it('should return false when unhealthy', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Connection refused'));

      const result = await service.healthCheck();

      expect(result).toBe(false);
    });
  });
});
