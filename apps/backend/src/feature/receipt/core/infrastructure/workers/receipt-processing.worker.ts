import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ProcessReceiptUseCase } from '../../application/use-cases/process-receipt.use-case';
import { EnrichReceiptDataUseCase } from '../../application/use-cases/enrich-receipt-data.use-case';
import { EnrichedReceiptDataDto } from '../../application/dto/enriched-receipt-data.dto';
import { ProgressTracker } from '../../application/services/progress-tracker';
import { ConfigService } from '@nestjs/config';

interface ReceiptJobData {
  imageBase64: string;
  userId?: string;
}

@Processor('receipt-processing')
export class ReceiptProcessingWorker extends WorkerHost {
  private readonly logger = new Logger(ReceiptProcessingWorker.name);
  private readonly useVision: boolean;

  constructor(
    private readonly processReceiptUseCase: ProcessReceiptUseCase,
    private readonly enrichReceiptDataUseCase: EnrichReceiptDataUseCase,
    private readonly configService: ConfigService,
  ) {
    super();
    this.useVision =
      this.configService.get<string>('VISION_PARSER') === 'donut' ||
      !!this.configService.get<string>('OLLAMA_VISION_MODEL');
  }

  async process(job: Job<ReceiptJobData>): Promise<EnrichedReceiptDataDto> {
    this.logger.log(`Processing receipt job ${job.id}`);

    const imageBuffer = Buffer.from(job.data.imageBase64, 'base64');
    const userId = job.data.userId;

    const stages = this.useVision
      ? [
          { name: 'context', weight: 5 },
          { name: 'vision-parse', weight: 85 },
          { name: 'enrich', weight: 10 },
        ]
      : [
          { name: 'ocr', weight: 5 },
          { name: 'context', weight: 1 },
          { name: 'llm-parse', weight: 80 },
          { name: 'enrich', weight: 4 },
        ];

    const tracker = new ProgressTracker(stages, (percent) =>
      job.updateProgress(percent),
    );

    const processedResult = await this.processReceiptUseCase.execute(
      imageBuffer,
      userId,
      tracker,
      { skipOcr: this.useVision },
    );

    tracker.startStage('enrich');
    const enrichedResult = await this.enrichReceiptDataUseCase.execute(
      processedResult,
      userId,
    );
    tracker.completeStage('enrich');
    tracker.complete();

    this.logger.log(`Receipt job ${job.id} completed`);
    return enrichedResult;
  }
}
