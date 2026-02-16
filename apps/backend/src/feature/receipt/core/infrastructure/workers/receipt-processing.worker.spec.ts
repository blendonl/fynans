import { ReceiptProcessingWorker } from './receipt-processing.worker';
import { ProcessReceiptUseCase } from '../../application/use-cases/process-receipt.use-case';
import { EnrichReceiptDataUseCase } from '../../application/use-cases/enrich-receipt-data.use-case';
import { Job } from 'bullmq';

describe('ReceiptProcessingWorker', () => {
  let worker: ReceiptProcessingWorker;
  let processReceiptUseCase: { execute: jest.Mock };
  let enrichReceiptDataUseCase: { execute: jest.Mock };
  let job: Partial<Job>;

  const imageBase64 = Buffer.from('fake-image').toString('base64');

  const mockProcessedResult = {
    storeName: 'Test Store',
    storeLocation: '123 Main St',
    items: [{ name: 'Item 1', price: 9.99, quantity: 1 }],
    recordedAt: new Date('2026-01-15'),
    extractedText: 'raw receipt text',
    confidence: 0.92,
    parserUsed: 'test-parser',
  };

  const mockEnrichedResult = {
    store: { id: 'store-1', name: 'Test Store', location: '123 Main St' },
    items: [
      { id: 'item-1', name: 'Item 1', price: 9.99, category: 'cat-1', quantity: 1 },
    ],
    recordedAt: new Date('2026-01-15'),
    extractedText: 'raw receipt text',
    confidence: 0.92,
    parserUsed: 'test-parser',
  };

  beforeEach(() => {
    processReceiptUseCase = { execute: jest.fn() };
    enrichReceiptDataUseCase = { execute: jest.fn() };

    const configService = { get: jest.fn().mockReturnValue(undefined) };

    worker = new ReceiptProcessingWorker(
      processReceiptUseCase as any as ProcessReceiptUseCase,
      enrichReceiptDataUseCase as any as EnrichReceiptDataUseCase,
      configService as any,
    );

    job = {
      id: 'test-job-1',
      data: { imageBase64, userId: 'user-1' },
      updateProgress: jest.fn(),
    };

    processReceiptUseCase.execute.mockResolvedValue(mockProcessedResult);
    enrichReceiptDataUseCase.execute.mockResolvedValue(mockEnrichedResult);
  });

  it('should be defined', () => {
    expect(worker).toBeDefined();
  });

  describe('process', () => {
    it('should decode base64 buffer and call processReceiptUseCase.execute', async () => {
      await worker.process(job as Job);

      const expectedBuffer = Buffer.from(imageBase64, 'base64');
      expect(processReceiptUseCase.execute).toHaveBeenCalledWith(
        expectedBuffer,
        'user-1',
        expect.anything(),
      );
    });

    it('should call enrichReceiptDataUseCase.execute with processed result and userId', async () => {
      await worker.process(job as Job);

      expect(enrichReceiptDataUseCase.execute).toHaveBeenCalledWith(
        mockProcessedResult,
        'user-1',
      );
    });

    it('should report progress reaching 100%', async () => {
      await worker.process(job as Job);

      expect(job.updateProgress).toHaveBeenCalled();
      const calls = (job.updateProgress as jest.Mock).mock.calls;
      const lastPercent = calls[calls.length - 1][0];
      expect(lastPercent).toBe(100);
    });

    it('should return enriched result', async () => {
      const result = await worker.process(job as Job);

      expect(result).toEqual(mockEnrichedResult);
    });

    it('should propagate error from processReceiptUseCase', async () => {
      processReceiptUseCase.execute.mockRejectedValue(
        new Error('OCR service unavailable'),
      );

      await expect(worker.process(job as Job)).rejects.toThrow(
        'OCR service unavailable',
      );
    });
  });
});
