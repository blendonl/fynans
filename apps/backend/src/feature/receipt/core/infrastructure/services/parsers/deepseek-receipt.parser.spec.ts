import { ConfigService } from '@nestjs/config';
import { DeepseekReceiptParser } from './deepseek-receipt.parser';
import { ReceiptParsingContext } from '../../../application/services/receipt-parser.service';
import { ReceiptPostProcessor } from '../receipt-post-processor';

describe('DeepseekReceiptParser', () => {
  let parser: DeepseekReceiptParser;
  let configService: ConfigService;
  let postProcessor: ReceiptPostProcessor;
  let originalFetch: typeof global.fetch;

  const defaultContext: ReceiptParsingContext = {
    confidence: 0.9,
    rawText: 'some raw text from OCR',
  };

  const validJsonResponse = JSON.stringify({
    storeName: 'Test Store',
    storeLocation: '123 Main St',
    date: '15/02/2026',
    time: '14:30',
    total: 7.5,
    expenseCategory: 'Groceries',
    items: [
      { name: 'Qumesht', price: 3.5, quantity: 1, category: 'Dairy', size: null },
      { name: 'Buke', price: 2.0, quantity: 2, category: 'Bakery', size: null },
    ],
  });

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          DEEPSEEK_API_KEY: 'sk-test-key',
          DEEPSEEK_PARSER_MODEL: 'deepseek-chat',
          DEEPSEEK_PARSER_ENDPOINT: '',
          DEEPSEEK_OCR_ENDPOINT: 'https://api.deepseek.com',
          DEEPSEEK_PARSER_TIMEOUT: '60000',
        };
        return config[key] ?? defaultValue;
      }),
    } as any;

    postProcessor = new ReceiptPostProcessor();

    parser = new DeepseekReceiptParser(configService, postProcessor, undefined);
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should be defined', () => {
    expect(parser).toBeDefined();
    expect(parser.name).toBe('deepseek');
  });

  describe('parse', () => {
    it('should throw if API key is not set', async () => {
      const noKeyConfig = {
        get: jest.fn((key: string, defaultValue?: any) => {
          const config: Record<string, any> = { DEEPSEEK_API_KEY: '' };
          return config[key] ?? defaultValue;
        }),
      } as any;
      const noKeyParser = new DeepseekReceiptParser(
        noKeyConfig,
        postProcessor,
        undefined,
      );

      const text = 'This is a long enough receipt text for parsing';

      await expect(noKeyParser.parse(text, defaultContext)).rejects.toThrow(
        /DEEPSEEK_API_KEY is required/,
      );
    });

    it('should successfully parse a well-formed JSON response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: validJsonResponse } }],
          usage: { prompt_tokens: 500, completion_tokens: 200 },
        }),
      } as Response);

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.storeName).toBe('Test Store');
      expect(result.storeLocation).toBe('123 Main St');
      expect(result.items).toHaveLength(2);
      expect(result.items[0].name).toBe('Qumesht');
      expect(result.items[0].price).toBe(3.5);
      expect(result.items[0].quantity).toBe(1);
      expect(result.items[1].name).toBe('Buke');
      expect(result.items[1].price).toBe(2.0);
      expect(result.items[1].quantity).toBe(2);
      expect(result.totalAmount).toBe(7.5);
      expect(result.date).toBe('15/02/2026');
      expect(result.time).toBe('14:30');
      expect(result.parserUsed).toBe('deepseek');
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Verify API call structure
      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl).toBe('https://api.deepseek.com/v1/chat/completions');

      const callBody = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[0][1].body,
      );
      expect(callBody.model).toBe('deepseek-chat');
      expect(callBody.messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          expect.objectContaining({ role: 'user' }),
        ]),
      );
      expect(callBody.temperature).toBe(0);
    });

    it('should parse date and time into recordedAt', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: validJsonResponse } }],
        }),
      } as Response);

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.recordedAt).toBeInstanceOf(Date);
      expect(result.recordedAt!.getFullYear()).toBe(2026);
      expect(result.recordedAt!.getMonth()).toBe(1); // February
      expect(result.recordedAt!.getDate()).toBe(15);
      expect(result.recordedAt!.getHours()).toBe(14);
      expect(result.recordedAt!.getMinutes()).toBe(30);
    });

    it('should return undefined recordedAt when date is not present', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  storeName: 'Test Store',
                  items: [{ name: 'Milk', price: 5.0, quantity: 1, category: 'Dairy', size: null }],
                }),
              },
            },
          ],
        }),
      } as Response);

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.recordedAt).toBeUndefined();
    });

    it('should retry when first attempt returns no items', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: '{}' } }],
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: validJsonResponse } }],
          }),
        } as Response);

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result.items).toHaveLength(2);
    });

    it('should handle malformed JSON gracefully', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'This is not JSON at all' } }],
        }),
      } as Response);

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.storeName).toBe('Unknown');
      expect(result.items).toHaveLength(0);
    });

    it('should handle API errors', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal server error',
      } as Response);

      const text = 'This is a long enough receipt text for parsing';

      await expect(parser.parse(text, defaultContext)).rejects.toThrow(
        /DeepSeek API error/,
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
            choices: [{ message: { content: validJsonResponse } }],
          }),
        } as Response);

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.items).toHaveLength(2);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const text = 'This is a long enough receipt text for parsing';

      await expect(parser.parse(text, defaultContext)).rejects.toThrow(
        /DeepSeek API call failed after 3 attempts/,
      );
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should use custom parser endpoint when set', async () => {
      const customConfigService = {
        get: jest.fn((key: string, defaultValue?: any) => {
          const config: Record<string, any> = {
            DEEPSEEK_API_KEY: 'sk-test',
            DEEPSEEK_PARSER_MODEL: 'deepseek-chat',
            DEEPSEEK_PARSER_ENDPOINT: 'https://custom-parser.deepseek.com',
            DEEPSEEK_PARSER_TIMEOUT: '30000',
          };
          return config[key] ?? defaultValue;
        }),
      } as any;

      const customParser = new DeepseekReceiptParser(
        customConfigService,
        postProcessor,
        undefined,
      );

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: validJsonResponse } }],
        }),
      } as Response);

      const text = 'This is a long enough receipt text for parsing';
      await customParser.parse(text, defaultContext);

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl).toBe(
        'https://custom-parser.deepseek.com/v1/chat/completions',
      );
    });

    it('should fall back to OCR endpoint when parser endpoint is not set', async () => {
      const customConfigService = {
        get: jest.fn((key: string, defaultValue?: any) => {
          const config: Record<string, any> = {
            DEEPSEEK_API_KEY: 'sk-test',
            DEEPSEEK_PARSER_MODEL: 'deepseek-chat',
            DEEPSEEK_PARSER_ENDPOINT: '',
            DEEPSEEK_OCR_ENDPOINT: 'https://ocr-only.deepseek.com',
            DEEPSEEK_PARSER_TIMEOUT: '30000',
          };
          return config[key] ?? defaultValue;
        }),
      } as any;

      const customParser = new DeepseekReceiptParser(
        customConfigService,
        postProcessor,
        undefined,
      );

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: validJsonResponse } }],
        }),
      } as Response);

      const text = 'This is a long enough receipt text for parsing';
      await customParser.parse(text, defaultContext);

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl).toBe(
        'https://ocr-only.deepseek.com/v1/chat/completions',
      );
    });

    it('should handle timeout errors', async () => {
      global.fetch = jest.fn().mockImplementation(() => {
        const abortError = new Error('Aborted');
        abortError.name = 'AbortError';
        return Promise.reject(abortError);
      });

      const text = 'This is a long enough receipt text for parsing';

      await expect(parser.parse(text, defaultContext)).rejects.toThrow();
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should parse expense category suggestion', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: validJsonResponse } }],
        }),
      } as Response);

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.suggestedExpenseCategory).toBe('Groceries');
    });

    it('should extract item sizes from JSON response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  storeName: 'Test Store',
                  items: [
                    {
                      name: 'Cola',
                      price: 1.5,
                      quantity: 1,
                      category: 'Beverages',
                      size: { value: 2, unit: 'l' },
                    },
                    {
                      name: 'Milk',
                      price: 0.99,
                      quantity: 1,
                      category: 'Dairy',
                      size: null,
                    },
                  ],
                }),
              },
            },
          ],
        }),
      } as Response);

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.items).toHaveLength(2);
      expect(result.items[0].size).toEqual({ value: 2, unit: 'l' });
      expect(result.items[1].size).toBeUndefined();
    });

    it('should pass authorization header with API key', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: validJsonResponse } }],
        }),
      } as Response);

      const text = 'This is a long enough receipt text for parsing';
      await parser.parse(text, defaultContext);

      const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
      expect(headers.Authorization).toBe('Bearer sk-test-key');
    });
  });
});
