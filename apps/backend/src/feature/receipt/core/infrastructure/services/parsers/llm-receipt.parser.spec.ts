import { LlmReceiptParser } from './llm-receipt.parser';
import { IOllamaService } from '../../../application/interfaces/ollama.interface';
import { ReceiptParsingContext } from '../../../application/services/receipt-parser.service';

describe('LlmReceiptParser', () => {
  let parser: LlmReceiptParser;
  let ollamaService: jest.Mocked<IOllamaService>;

  const defaultContext: ReceiptParsingContext = {
    confidence: 0.9,
    rawText: 'some raw text from OCR',
  };

  const validReceiptJson = {
    storeName: 'Test Store',
    storeLocation: '123 Main St',
    items: [
      { name: 'Milk', price: 3.5, quantity: 1 },
      { name: 'Bread', price: 2.0, quantity: 2 },
    ],
    totalAmount: 7.5,
    date: '15/02/2026',
    time: '14:30',
  };

  beforeEach(() => {
    ollamaService = {
      healthCheck: jest.fn().mockResolvedValue(true),
      generateCompletion: jest.fn(),
    };

    parser = new LlmReceiptParser(ollamaService);
  });

  it('should be defined', () => {
    expect(parser).toBeDefined();
    expect(parser.name).toBe('llm');
  });

  describe('canParse', () => {
    it('should return true for text longer than 20 characters', () => {
      const text = 'This is a receipt text that is long enough';
      expect(parser.canParse(text)).toBe(true);
    });

    it('should return false for short text', () => {
      const text = 'short';
      expect(parser.canParse(text)).toBe(false);
    });

    it('should return false for text with exactly 20 characters', () => {
      const text = '12345678901234567890';
      expect(text.length).toBe(20);
      expect(parser.canParse(text)).toBe(false);
    });
  });

  describe('parse', () => {
    it('should throw when Ollama service is unhealthy', async () => {
      ollamaService.healthCheck.mockResolvedValue(false);

      const text = 'This is a long enough receipt text for parsing';

      await expect(parser.parse(text, defaultContext)).rejects.toThrow(
        'Ollama service is not available',
      );
      expect(ollamaService.healthCheck).toHaveBeenCalledTimes(1);
      expect(ollamaService.generateCompletion).not.toHaveBeenCalled();
    });

    it('should successfully parse a well-formed LLM response', async () => {
      ollamaService.generateCompletion.mockResolvedValue({
        response: JSON.stringify(validReceiptJson),
      });

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.storeName).toBe('Test Store');
      expect(result.storeLocation).toBe('123 Main St');
      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toEqual({ name: 'Milk', price: 3.5, quantity: 1 });
      expect(result.items[1]).toEqual({ name: 'Bread', price: 2.0, quantity: 2 });
      expect(result.totalAmount).toBe(7.5);
      expect(result.date).toBe('15/02/2026');
      expect(result.time).toBe('14:30');
      expect(result.parserUsed).toBe('llm');
      expect(ollamaService.generateCompletion).toHaveBeenCalledTimes(1);
    });

    it('should filter out items with negative price', async () => {
      const receiptWithInvalidItems = {
        ...validReceiptJson,
        items: [
          { name: 'Valid Item', price: 5.0, quantity: 1 },
          { name: 'Negative Price', price: -2.0, quantity: 1 },
        ],
        totalAmount: 5.0,
      };

      ollamaService.generateCompletion.mockResolvedValue({
        response: JSON.stringify(receiptWithInvalidItems),
      });

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Valid Item');
    });

    it('should filter out items with empty name', async () => {
      const receiptWithEmptyName = {
        ...validReceiptJson,
        items: [
          { name: 'Valid Item', price: 5.0, quantity: 1 },
          { name: '', price: 3.0, quantity: 1 },
        ],
        totalAmount: 5.0,
      };

      ollamaService.generateCompletion.mockResolvedValue({
        response: JSON.stringify(receiptWithEmptyName),
      });

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Valid Item');
    });

    it('should filter out items with price >= 100000', async () => {
      const receiptWithExpensiveItem = {
        ...validReceiptJson,
        items: [
          { name: 'Valid Item', price: 5.0, quantity: 1 },
          { name: 'Too Expensive', price: 100000, quantity: 1 },
        ],
        totalAmount: 5.0,
      };

      ollamaService.generateCompletion.mockResolvedValue({
        response: JSON.stringify(receiptWithExpensiveItem),
      });

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Valid Item');
    });

    it('should throw when response contains no JSON', async () => {
      ollamaService.generateCompletion.mockResolvedValue({
        response: 'This is just plain text without any JSON',
      });

      const text = 'This is a long enough receipt text for parsing';

      await expect(parser.parse(text, defaultContext)).rejects.toThrow(
        'No JSON found in LLM response',
      );
    });

    it('should throw when response contains invalid JSON', async () => {
      ollamaService.generateCompletion.mockResolvedValue({
        response: '{ invalid json here }',
      });

      const text = 'This is a long enough receipt text for parsing';

      await expect(parser.parse(text, defaultContext)).rejects.toThrow(
        'Failed to parse JSON from LLM response',
      );
    });

    it('should log warning when items total differs from receipt total by more than 10%', async () => {
      const loggerSpy = jest.spyOn(
        (parser as any).logger,
        'warn',
      );

      const mismatchedReceipt = {
        ...validReceiptJson,
        items: [{ name: 'Item', price: 5.0, quantity: 1 }],
        totalAmount: 20.0,
      };

      ollamaService.generateCompletion.mockResolvedValue({
        response: JSON.stringify(mismatchedReceipt),
      });

      const text = 'This is a long enough receipt text for parsing';
      await parser.parse(text, defaultContext);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('differs from receipt total'),
      );
    });

    it('should not log warning when items total matches receipt total within 10%', async () => {
      const loggerSpy = jest.spyOn(
        (parser as any).logger,
        'warn',
      );

      const matchingReceipt = {
        ...validReceiptJson,
        items: [{ name: 'Item', price: 10.0, quantity: 1 }],
        totalAmount: 10.5,
      };

      ollamaService.generateCompletion.mockResolvedValue({
        response: JSON.stringify(matchingReceipt),
      });

      const text = 'This is a long enough receipt text for parsing';
      await parser.parse(text, defaultContext);

      expect(loggerSpy).not.toHaveBeenCalled();
    });

    it('should parse date and time into recordedAt', async () => {
      ollamaService.generateCompletion.mockResolvedValue({
        response: JSON.stringify(validReceiptJson),
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

    it('should parse date without time into recordedAt', async () => {
      const receiptNoTime = {
        ...validReceiptJson,
        time: null,
      };

      ollamaService.generateCompletion.mockResolvedValue({
        response: JSON.stringify(receiptNoTime),
      });

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.recordedAt).toBeInstanceOf(Date);
      expect(result.recordedAt!.getFullYear()).toBe(2026);
      expect(result.recordedAt!.getMonth()).toBe(1);
      expect(result.recordedAt!.getDate()).toBe(15);
    });

    it('should return undefined recordedAt when date is null', async () => {
      const receiptNoDate = {
        ...validReceiptJson,
        date: null,
        time: null,
      };

      ollamaService.generateCompletion.mockResolvedValue({
        response: JSON.stringify(receiptNoDate),
      });

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.recordedAt).toBeUndefined();
    });

    it('should default storeName to "Unknown Store" when missing', async () => {
      const receiptNoStore = {
        ...validReceiptJson,
        storeName: '',
      };

      ollamaService.generateCompletion.mockResolvedValue({
        response: JSON.stringify(receiptNoStore),
      });

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.storeName).toBe('Unknown Store');
    });

    it('should default item quantity to 1 when not specified', async () => {
      const receiptNoQuantity = {
        ...validReceiptJson,
        items: [{ name: 'Item', price: 5.0 }],
        totalAmount: 5.0,
      };

      ollamaService.generateCompletion.mockResolvedValue({
        response: JSON.stringify(receiptNoQuantity),
      });

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.items[0].quantity).toBe(1);
    });
  });
});
