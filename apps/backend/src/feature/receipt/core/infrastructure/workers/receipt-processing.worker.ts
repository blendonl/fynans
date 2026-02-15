import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ProcessReceiptUseCase } from '../../application/use-cases/process-receipt.use-case';
import { EnrichReceiptDataUseCase } from '../../application/use-cases/enrich-receipt-data.use-case';
import { ProgressTracker } from '../../application/services/progress-tracker';

interface ReceiptJobData {
  imageBase64: string;
  userId?: string;
}

@Processor('receipt-processing')
export class ReceiptProcessingWorker extends WorkerHost {
  private readonly logger = new Logger(ReceiptProcessingWorker.name);

  constructor(
    private readonly processReceiptUseCase: ProcessReceiptUseCase,
    private readonly enrichReceiptDataUseCase: EnrichReceiptDataUseCase,
  ) {
    super();
  }

  async process(job: Job<ReceiptJobData>): Promise<Record<string, any>> {
    this.logger.log(`Processing receipt job ${job.id}`);

    const imageBuffer = Buffer.from(job.data.imageBase64, 'base64');
    const userId = job.data.userId;

    // Weights reflect actual relative duration of each stage:
    // OCR ~5s, context ~1s, LLM parse ~40-60s, LLM normalize ~30-40s, enrich ~1s
    const tracker = new ProgressTracker(
      [
        { name: 'ocr', weight: 5 },
        { name: 'context', weight: 1 },
        { name: 'llm-parse', weight: 45 },
        { name: 'llm-normalize', weight: 35 },
        { name: 'enrich', weight: 4 },
      ],
      (percent) => job.updateProgress(percent),
    );

    const processedResult = await this.processReceiptUseCase.execute(
      imageBuffer,
      userId,
      tracker,
    );

    tracker.startStage('enrich');
    const enrichedResult = await this.enrichReceiptDataUseCase.execute(
      processedResult,
      userId,
    );
    tracker.completeStage('enrich');
    tracker.complete();

    this.logger.log(`Receipt job ${job.id} completed`);
    return enrichedResult as unknown as Record<string, any>;
  }
}
