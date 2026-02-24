import { LlmReceiptParser } from './llm-receipt.parser';
import { ILlmService } from '../../../application/interfaces/llm.interface';
import { ReceiptParsingContext } from '../../../application/services/receipt-parser.service';
import { ReceiptPostProcessor } from '../receipt-post-processor';

describe('LlmReceiptParser', () => {
  let parser: LlmReceiptParser;
  let llmService: jest.Mocked<ILlmService>;
  let postProcessor: ReceiptPostProcessor;

  const defaultContext: ReceiptParsingContext = {
    confidence: 0.9,
    rawText: 'some raw text from OCR',
  };

  const validJsonResponse = JSON.stringify({
    storeName: 'Test Store',
    storeLocation: '123 Main St',
    date: '15/02/2026',
    time: '14:30',
    total: 7.50,
    expenseCategory: 'Groceries',
    items: [
      { name: 'Qumesht', price: 3.50, quantity: 1, category: 'Dairy', size: null },
      { name: 'Buke', price: 2.00, quantity: 2, category: 'Bakery', size: null },
    ],
  });

  beforeEach(() => {
    llmService = {
      healthCheck: jest.fn().mockResolvedValue(true),
      generateCompletion: jest.fn(),
    };
    postProcessor = new ReceiptPostProcessor();

    parser = new LlmReceiptParser(llmService, postProcessor);
  });

  it('should be defined', () => {
    expect(parser).toBeDefined();
    expect(parser.name).toBe('llm');
  });

  describe('parse', () => {
    it('should throw when LLM service is unhealthy', async () => {
      llmService.healthCheck.mockResolvedValue(false);

      const text = 'This is a long enough receipt text for parsing';

      await expect(parser.parse(text, defaultContext)).rejects.toThrow(
        'LLM service is not available',
      );
      expect(llmService.healthCheck).toHaveBeenCalledTimes(1);
      expect(llmService.generateCompletion).not.toHaveBeenCalled();
    });

    it('should successfully parse a well-formed JSON response', async () => {
      llmService.generateCompletion.mockResolvedValue({
        response: validJsonResponse,
      });

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
      expect(result.parserUsed).toBe('llm');
      expect(llmService.generateCompletion).toHaveBeenCalledTimes(1);
    });

    it('should request JSON format from LLM service', async () => {
      llmService.generateCompletion.mockResolvedValue({
        response: validJsonResponse,
      });

      const text = 'This is a long enough receipt text for parsing';
      await parser.parse(text, defaultContext);

      expect(llmService.generateCompletion).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ format: 'json' }),
      );
    });

    it('should filter out items with negative price', async () => {
      llmService.generateCompletion.mockResolvedValue({
        response: JSON.stringify({
          storeName: 'Test Store',
          items: [
            { name: 'Valid Item', price: 5.00, quantity: 1, category: 'Other', size: null },
            { name: 'Negative Price', price: -2.00, quantity: 1, category: 'Other', size: null },
          ],
        }),
      });

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Valid Item');
    });

    it('should retry when first attempt returns no items', async () => {
      llmService.generateCompletion
        .mockResolvedValueOnce({ response: '{}' })
        .mockResolvedValueOnce({ response: validJsonResponse });

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(llmService.generateCompletion).toHaveBeenCalledTimes(2);
      expect(result.items).toHaveLength(2);
    });

    it('should parse date and time into recordedAt', async () => {
      llmService.generateCompletion.mockResolvedValue({
        response: validJsonResponse,
      });

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.recordedAt).toBeInstanceOf(Date);
      expect(result.recordedAt!.getFullYear()).toBe(2026);
      expect(result.recordedAt!.getMonth()).toBe(1); // February is month index 1
      expect(result.recordedAt!.getDate()).toBe(15);
      expect(result.recordedAt!.getHours()).toBe(14);
      expect(result.recordedAt!.getMinutes()).toBe(30);
    });

    it('should return undefined recordedAt when date is not present', async () => {
      llmService.generateCompletion.mockResolvedValue({
        response: JSON.stringify({
          storeName: 'Test Store',
          items: [
            { name: 'Milk', price: 5.00, quantity: 1, category: 'Other', size: null },
          ],
        }),
      });

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.recordedAt).toBeUndefined();
    });

    it('should default item quantity to 1 when not specified', async () => {
      llmService.generateCompletion.mockResolvedValue({
        response: JSON.stringify({
          storeName: 'Test Store',
          total: 5.00,
          items: [
            { name: 'Milk', price: 5.00, category: 'Dairy', size: null },
          ],
        }),
      });

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.items[0].quantity).toBe(1);
    });

    it('should parse expense category suggestion', async () => {
      llmService.generateCompletion.mockResolvedValue({
        response: validJsonResponse,
      });

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.suggestedExpenseCategory).toBe('Groceries');
    });

    it('should extract item sizes from JSON response', async () => {
      llmService.generateCompletion.mockResolvedValue({
        response: JSON.stringify({
          storeName: 'Test Store',
          items: [
            { name: 'Cola', price: 1.50, quantity: 1, category: 'Beverages', size: { value: 2, unit: 'l' } },
            { name: 'Milk', price: 0.99, quantity: 1, category: 'Dairy', size: null },
          ],
        }),
      });

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.items).toHaveLength(2);
      expect(result.items[0].size).toEqual({ value: 2, unit: 'l' });
      expect(result.items[1].size).toBeUndefined();
    });

    it('should handle malformed JSON gracefully', async () => {
      llmService.generateCompletion.mockResolvedValue({
        response: 'This is not JSON at all',
      });

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.storeName).toBe('Unknown');
      expect(result.items).toHaveLength(0);
    });

    it('should handle JSON with _reasoning field (silently discarded)', async () => {
      llmService.generateCompletion.mockResolvedValue({
        response: JSON.stringify({
          _reasoning: 'Some chain-of-thought reasoning here',
          storeName: 'Test Store',
          items: [
            { name: 'Bread', price: 1.00, quantity: 1, category: 'Bakery', size: null },
          ],
        }),
      });

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.storeName).toBe('Test Store');
      expect(result.items).toHaveLength(1);
      // _reasoning should not appear anywhere in the result
      expect((result as any)._reasoning).toBeUndefined();
    });
  });
});
