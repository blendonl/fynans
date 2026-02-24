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
  receiptId?: string;
  familyId?: string;
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
          { name: 'vision-parse', weight: 90 },
          { name: 'enrich', weight: 10 },
        ]
      : [
          { name: 'ocr', weight: 10 },
          { name: 'llm-parse', weight: 85 },
          { name: 'enrich', weight: 5 },
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

    // Phase 1: Resolve store and items (fast)
    tracker.startStage('enrich');
    const partialResult = await this.enrichReceiptDataUseCase.resolveStoreAndItems(
      processedResult,
      userId,
    );

    // Emit partial result for immediate UI display
    await job.updateProgress({
      type: 'partial-result',
      percent: 90,
      data: partialResult,
    } as any);

    // Phase 2: Resolve categories (background)
    const categoryResult = await this.enrichReceiptDataUseCase.resolveCategories(
      processedResult,
      userId,
    );

    // Merge partial + category results into full enriched DTO
    const enrichedResult: EnrichedReceiptDataDto = {
      ...partialResult,
      items: partialResult.items.map((item) => ({
        ...item,
        suggestedItemCategoryId: item.suggestedItemCategory
          ? categoryResult.itemCategoryMap.get(item.suggestedItemCategory)
          : undefined,
        resolvedCategoryId:
          (item.suggestedItemCategory
            ? categoryResult.itemCategoryMap.get(item.suggestedItemCategory)
            : undefined) ||
          categoryResult.suggestedExpenseCategoryId ||
          undefined,
      })),
      suggestedExpenseCategoryId: categoryResult.suggestedExpenseCategoryId,
      suggestedExpenseCategoryName: categoryResult.suggestedExpenseCategoryName,
    };

    tracker.completeStage('enrich');
    tracker.complete();

    this.logger.log(`Receipt job ${job.id} completed`);
    return enrichedResult;
  }
}
