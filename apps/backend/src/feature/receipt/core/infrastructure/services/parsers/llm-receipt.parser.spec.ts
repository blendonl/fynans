import { LlmReceiptParser } from './llm-receipt.parser';
import { IOllamaService } from '../../../application/interfaces/ollama.interface';
import { ReceiptParsingContext } from '../../../application/services/receipt-parser.service';
import { ReceiptPostProcessor } from '../receipt-post-processor';

describe('LlmReceiptParser', () => {
  let parser: LlmReceiptParser;
  let ollamaService: jest.Mocked<IOllamaService>;
  let postProcessor: ReceiptPostProcessor;

  const defaultContext: ReceiptParsingContext = {
    confidence: 0.9,
    rawText: 'some raw text from OCR',
  };

  const validPipeDelimited = `STORE: Test Store
LOCATION: 123 Main St
DATE: 15/02/2026
TIME: 14:30
TOTAL: 7.50
EXPENSE_CATEGORY: Groceries
ITEMS:
name | nameEn | price | qty | category
Qumesht | Milk | 3.50 | 1 | Dairy
Buke | Bread | 2.00 | 2 | Bakery`;

  beforeEach(() => {
    ollamaService = {
      healthCheck: jest.fn().mockResolvedValue(true),
      generateCompletion: jest.fn(),
    };
    postProcessor = new ReceiptPostProcessor();

    parser = new LlmReceiptParser(ollamaService, postProcessor);
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

    it('should successfully parse a well-formed pipe-delimited response', async () => {
      ollamaService.generateCompletion.mockResolvedValue({
        response: validPipeDelimited,
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
      expect(ollamaService.generateCompletion).toHaveBeenCalledTimes(1);
    });

    it('should filter out items with negative price', async () => {
      ollamaService.generateCompletion.mockResolvedValue({
        response: `STORE: Test Store
ITEMS:
Valid Item | Valid Item | 5.00 | 1 | Other
Negative Price | Negative Price | -2.00 | 1 | Other`,
      });

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Valid Item');
    });

    it('should skip header rows in pipe-delimited items', async () => {
      ollamaService.generateCompletion.mockResolvedValue({
        response: `STORE: Test Store
ITEMS:
name | nameEn | price | qty | category
Milk | Milk | 5.00 | 1 | Other`,
      });

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Milk');
    });

    it('should retry when first attempt returns no items', async () => {
      ollamaService.generateCompletion
        .mockResolvedValueOnce({ response: 'No valid pipe delimited content' })
        .mockResolvedValueOnce({ response: validPipeDelimited });

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(ollamaService.generateCompletion).toHaveBeenCalledTimes(2);
      expect(result.items).toHaveLength(2);
    });

    it('should parse date and time into recordedAt', async () => {
      ollamaService.generateCompletion.mockResolvedValue({
        response: validPipeDelimited,
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
      ollamaService.generateCompletion.mockResolvedValue({
        response: `STORE: Test Store
ITEMS:
Milk | Milk | 5.00 | 1 | Other`,
      });

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.recordedAt).toBeUndefined();
    });

    it('should default item quantity to 1 when not specified', async () => {
      ollamaService.generateCompletion.mockResolvedValue({
        response: `STORE: Test Store
TOTAL: 5.00
ITEMS:
Milk | Milk | 5.00`,
      });

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.items[0].quantity).toBe(1);
    });

    it('should parse expense category suggestion', async () => {
      ollamaService.generateCompletion.mockResolvedValue({
        response: validPipeDelimited,
      });

      const text = 'This is a long enough receipt text for parsing';
      const result = await parser.parse(text, defaultContext);

      expect(result.suggestedExpenseCategory).toBe('Groceries');
    });
  });
});
