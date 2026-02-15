import { ReceiptJobQueueService } from './receipt-job-queue.service';

describe('ReceiptJobQueueService', () => {
  let service: ReceiptJobQueueService;
  let mockQueue: {
    add: jest.Mock;
    getJob: jest.Mock;
  };
  let mockJob: {
    id: string;
    getState: jest.Mock;
    progress: number;
    returnvalue: any;
    failedReason: string | undefined;
  };

  beforeEach(() => {
    mockJob = {
      id: 'test-job-id',
      getState: jest.fn(),
      progress: 0,
      returnvalue: undefined,
      failedReason: undefined,
    };

    mockQueue = {
      add: jest.fn().mockResolvedValue({ id: 'test-job-id' }),
      getJob: jest.fn().mockResolvedValue(mockJob),
    };

    service = new ReceiptJobQueueService(mockQueue as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addJob', () => {
    it('should create job with base64 image data and return job ID', async () => {
      const imageBuffer = Buffer.from('fake-image-data');
      const userId = 'user-123';

      const jobId = await service.addJob(imageBuffer, userId);

      expect(jobId).toBe('test-job-id');
      expect(mockQueue.add).toHaveBeenCalledWith(
        'process-receipt',
        {
          imageBase64: imageBuffer.toString('base64'),
          userId,
        },
        expect.any(Object),
      );
    });

    it('should pass correct job options (attempts, backoff, etc.)', async () => {
      const imageBuffer = Buffer.from('fake-image-data');

      await service.addJob(imageBuffer);

      expect(mockQueue.add).toHaveBeenCalledWith(
        'process-receipt',
        expect.any(Object),
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: { age: 86_400 },
          removeOnFail: { age: 86_400 },
        },
      );
    });
  });

  describe('getJobStatus', () => {
    it('should return not_found when job does not exist', async () => {
      mockQueue.getJob.mockResolvedValue(null);

      const status = await service.getJobStatus('non-existent-id');

      expect(status).toBe('not_found');
    });

    it('should map waiting state correctly', async () => {
      mockJob.getState.mockResolvedValue('waiting');

      const status = await service.getJobStatus('test-job-id');

      expect(status).toBe('waiting');
    });

    it('should map active state correctly', async () => {
      mockJob.getState.mockResolvedValue('active');

      const status = await service.getJobStatus('test-job-id');

      expect(status).toBe('active');
    });

    it('should map completed state correctly', async () => {
      mockJob.getState.mockResolvedValue('completed');

      const status = await service.getJobStatus('test-job-id');

      expect(status).toBe('completed');
    });

    it('should map delayed to waiting', async () => {
      mockJob.getState.mockResolvedValue('delayed');

      const status = await service.getJobStatus('test-job-id');

      expect(status).toBe('waiting');
    });
  });

  describe('getJobResult', () => {
    it('should return not_found for missing job', async () => {
      mockQueue.getJob.mockResolvedValue(null);

      const result = await service.getJobResult('non-existent-id');

      expect(result).toEqual({ status: 'not_found' });
    });

    it('should return completed result with data', async () => {
      const parsedData = { merchant: 'Test Store', total: 42.99 };
      mockJob.getState.mockResolvedValue('completed');
      mockJob.returnvalue = parsedData;
      mockJob.progress = 100;

      const result = await service.getJobResult('test-job-id');

      expect(result).toEqual({
        status: 'completed',
        data: parsedData,
        progress: 100,
      });
    });

    it('should return failed result with error', async () => {
      mockJob.getState.mockResolvedValue('failed');
      mockJob.failedReason = 'OCR extraction failed';
      mockJob.progress = 50;

      const result = await service.getJobResult('test-job-id');

      expect(result).toEqual({
        status: 'failed',
        error: 'OCR extraction failed',
        progress: 50,
      });
    });
  });
});
