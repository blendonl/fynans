import { ConfigService } from '@nestjs/config';
import { DeepseekOcrService } from './deepseek-ocr.service';

describe('DeepseekOcrService', () => {
  let service: DeepseekOcrService;
  let configService: ConfigService;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          DEEPSEEK_API_KEY: 'sk-test-key',
          DEEPSEEK_OCR_MODEL: 'deepseek/deepseek-ocr-2',
          DEEPSEEK_OCR_ENDPOINT: 'https://api.deepseek.com',
          DEEPSEEK_OCR_TIMEOUT: '60000',
        };
        return config[key] ?? defaultValue;
      }),
    } as any;

    service = new DeepseekOcrService(configService);
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractText', () => {
    it('should successfully extract text from image via vision API', async () => {
      const mockResponse = {
        choices: [
          {
            message: { content: 'MARKET EXTRA\nPrishtine\n...' },
            finish_reason: 'stop',
          },
        ],
        usage: { prompt_tokens: 500, completion_tokens: 200 },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const imageBuffer = Buffer.from('fake-image-data');
      const result = await service.extractText(imageBuffer);

      expect(result.text).toBe('MARKET EXTRA\nPrishtine\n...');
      expect(result.confidence).toBe(1.0);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl).toBe('https://api.deepseek.com/v1/chat/completions');

      const callBody = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[0][1].body,
      );
      expect(callBody.model).toBe('deepseek/deepseek-ocr-2');
      expect(callBody.messages[0].content).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'image_url' }),
          expect.objectContaining({ type: 'text', text: '<image>\nFree OCR.' }),
        ]),
      );
    });

    it('should throw if API key is not set', async () => {
      const noKeyConfig = {
        get: jest.fn((key: string, defaultValue?: any) => {
          const config: Record<string, any> = {
            DEEPSEEK_API_KEY: '',
          };
          return config[key] ?? defaultValue;
        }),
      } as any;
      const noKeyService = new DeepseekOcrService(noKeyConfig);

      const imageBuffer = Buffer.from('fake-image-data');
      await expect(noKeyService.extractText(imageBuffer)).rejects.toThrow(
        /DEEPSEEK_API_KEY is required/,
      );
    });

    it('should handle API errors', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal server error',
      } as Response);

      const imageBuffer = Buffer.from('fake-image-data');

      await expect(service.extractText(imageBuffer)).rejects.toThrow(
        /DeepSeek OCR API error/,
      );
    });

    it('should handle empty response content', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '' } }],
        }),
      } as Response);

      const imageBuffer = Buffer.from('fake-image-data');

      await expect(service.extractText(imageBuffer)).rejects.toThrow(
        /empty content/,
      );
    });

    it('should retry on network failure', async () => {
      global.fetch = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: 'Success after retries' } }],
          }),
        } as Response);

      const imageBuffer = Buffer.from('fake-image-data');
      const result = await service.extractText(imageBuffer);

      expect(result.text).toBe('Success after retries');
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const imageBuffer = Buffer.from('fake-image-data');

      await expect(service.extractText(imageBuffer)).rejects.toThrow(
        /Failed to extract text via DeepSeek OCR after 3 attempts/,
      );
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle timeout errors', async () => {
      global.fetch = jest.fn().mockImplementation(() => {
        const abortError = new Error('Aborted');
        abortError.name = 'AbortError';
        return Promise.reject(abortError);
      });

      const imageBuffer = Buffer.from('fake-image-data');

      await expect(service.extractText(imageBuffer)).rejects.toThrow();
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should use custom endpoint from config', async () => {
      const customConfigService = {
        get: jest.fn((key: string, defaultValue?: any) => {
          const config: Record<string, any> = {
            DEEPSEEK_API_KEY: 'sk-test',
            DEEPSEEK_OCR_ENDPOINT: 'https://custom.deepseek-proxy.com',
            DEEPSEEK_OCR_MODEL: 'deepseek/deepseek-ocr-2',
            DEEPSEEK_OCR_TIMEOUT: '30000',
          };
          return config[key] ?? defaultValue;
        }),
      } as any;

      const customService = new DeepseekOcrService(customConfigService);

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Test' } }],
        }),
      } as Response);

      const imageBuffer = Buffer.from('fake-image-data');
      await customService.extractText(imageBuffer);

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl).toBe(
        'https://custom.deepseek-proxy.com/v1/chat/completions',
      );
    });

    it('should use custom model from config', async () => {
      const customConfigService = {
        get: jest.fn((key: string, defaultValue?: any) => {
          const config: Record<string, any> = {
            DEEPSEEK_API_KEY: 'sk-test',
            DEEPSEEK_OCR_ENDPOINT: 'https://api.deepseek.com',
            DEEPSEEK_OCR_MODEL: 'custom-ocr-model',
            DEEPSEEK_OCR_TIMEOUT: '30000',
          };
          return config[key] ?? defaultValue;
        }),
      } as any;

      const customService = new DeepseekOcrService(customConfigService);

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Test' } }],
        }),
      } as Response);

      const imageBuffer = Buffer.from('fake-image-data');
      await customService.extractText(imageBuffer);

      const callBody = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[0][1].body,
      );
      expect(callBody.model).toBe('custom-ocr-model');
    });

    it('should resize large images before sending', async () => {
      // Create a buffer larger than 10MB
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Test after resize' } }],
        }),
      } as Response);

      const result = await service.extractText(largeBuffer);

      expect(result.text).toBe('Test after resize');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle 401 unauthorized errors', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      } as Response);

      const imageBuffer = Buffer.from('fake-image-data');

      await expect(service.extractText(imageBuffer)).rejects.toThrow(
        /DeepSeek OCR API error/,
      );
    });
  });
});
